const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const crypto = require('crypto');
const { Order, OrderItem, Book } = require('../models');

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

/**
 * POST /api/mp/create-preference
 * Crea una preferencia de pago en MercadoPago
 */
const createPreference = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Book, as: 'book', attributes: ['title', 'coverImage'] }],
        },
      ],
    });

    if (!order) return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'El pedido ya fue procesado' });
    }

    const backUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const preferenceData = {
      items: order.items.map((item) => ({
        id: item.bookId,
        title: `${item.book.title} (${item.type === 'physical' ? 'Físico' : 'Digital'})`,
        quantity: item.quantity,
        unit_price: parseFloat(item.unitPrice),
        currency_id: 'ARS',
      })),
      payer: {
        email: order.guestEmail || req.user?.email,
        name: order.guestFirstName || req.user?.firstName,
        surname: order.guestLastName || req.user?.lastName,
      },
      back_urls: {
        success: `${backUrl}/checkout/resultado?status=success&orderId=${order.id}`,
        failure: `${backUrl}/checkout/resultado?status=failure&orderId=${order.id}`,
        pending: `${backUrl}/checkout/resultado?status=pending&orderId=${order.id}`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.API_URL || 'http://localhost:3001'}/api/mp/webhook`,
      external_reference: order.orderNumber,
      // Sin cuotas — pago en un solo pago
      payment_methods: {
        installments: 1,
        excluded_payment_types: [],
      },
    };

    const preference = new Preference(mp);
    const result = await preference.create({ body: preferenceData });

    await order.update({ mpPreferenceId: result.id });

    res.json({
      success: true,
      data: {
        preferenceId: result.id,
        initPoint: result.init_point, // URL de redirect a MP
        sandboxInitPoint: result.sandbox_init_point,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/mp/webhook
 * Webhook de MercadoPago — confirma el pago y actualiza el pedido
 */
const webhook = async (req, res, next) => {
  try {
    // Validar firma del webhook
    const signature = req.headers['x-signature'];
    const requestId = req.headers['x-request-id'];

    if (process.env.MP_WEBHOOK_SECRET && signature) {
      const ts = signature.match(/ts=(\d+)/)?.[1];
      const v1 = signature.match(/v1=([a-f0-9]+)/)?.[1];
      const manifest = `id:${req.body.data?.id};request-id:${requestId};ts:${ts};`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
        .update(manifest)
        .digest('hex');

      if (expectedSignature !== v1) {
        return res.status(401).json({ success: false, error: 'Firma de webhook inválida' });
      }
    }

    const { type, data } = req.body;

    if (type !== 'payment') {
      return res.status(200).json({ success: true }); // Ignorar otros tipos de notificación
    }

    const payment = new Payment(mp);
    const paymentData = await payment.get({ id: data.id });

    const order = await Order.findOne({
      where: { orderNumber: paymentData.external_reference },
      include: [{ model: OrderItem, as: 'items' }],
    });

    if (!order) {
      console.warn(`[MP Webhook] Pedido no encontrado para external_reference: ${paymentData.external_reference}`);
      return res.status(200).json({ success: true });
    }

    if (paymentData.status === 'approved' && order.status === 'pending') {
      await order.update({
        status: 'paid',
        mpPaymentId: String(paymentData.id),
        fulfillmentStatus: 'processing',
      });

      // Descontar stock físico y generar tokens de descarga para digitales
      for (const item of order.items) {
        if (item.type === 'physical') {
          await Book.decrement('physicalStock', { by: item.quantity, where: { id: item.bookId } });
        }

        if (item.type === 'digital') {
          const downloadToken = crypto.randomBytes(32).toString('hex');
          const downloadTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días ⚠️ TBD
          await item.update({ downloadToken, downloadTokenExpiry });

          // ⚠️ TBD: enviar email al comprador con link de descarga
          if (process.env.NODE_ENV === 'development') {
            console.log(`[DEV] Token de descarga para item ${item.id}: ${downloadToken}`);
          }
        }
      }
    } else if (['rejected', 'cancelled'].includes(paymentData.status)) {
      await order.update({ status: 'failed' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[MP Webhook] Error:', error);
    // Siempre responder 200 a MP para evitar reintentos
    res.status(200).json({ success: true });
  }
};

module.exports = { createPreference, webhook };
