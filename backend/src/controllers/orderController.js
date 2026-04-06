const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Book = require('../models/Book');
const { Op } = require('sequelize');

const getMpClient = () => new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-your-access-token',
});

// POST /api/orders — create order + MP preference (user must be logged in)
const createOrder = async (req, res) => {
  try {
    const { items, direccionEnvio, nombreComprador, emailComprador, telefonoComprador } = req.body;
    const userId = req.user?.id || null;

    if (!items?.length) return res.status(400).json({ error: 'El carrito está vacío' });
    if (!nombreComprador || !emailComprador) return res.status(400).json({ error: 'Nombre y email son requeridos' });

    // Check stock for physical items
    for (const item of items.filter(i => i.edicion === 'fisico')) {
      const book = await Book.findByPk(item.bookId);
      if (!book || !book.activo) return res.status(400).json({ error: `"${item.titulo}" no está disponible` });
      if (book.stock < item.qty) return res.status(400).json({ error: `Stock insuficiente para "${item.titulo}" (disponible: ${book.stock})` });
    }

    const types = [...new Set(items.map(i => i.edicion))];
    const tipoEntrega = types.length > 1 ? 'mixto' : types[0];
    const total = items.reduce((sum, i) => sum + Number(i.precio) * i.qty, 0);

    const order = await Order.create({
      status: 'pending',
      total,
      tipoEntrega,
      direccionEnvio: tipoEntrega !== 'digital' ? (direccionEnvio || null) : null,
      nombreComprador,
      emailComprador: emailComprador.toLowerCase(),
      telefonoComprador: telefonoComprador || null,
      userId,
    });

    // Fetch archivoDigital for digital items
    const itemsWithFiles = await Promise.all(items.map(async (i) => {
      let archivoDigital = null;
      if (i.edicion === 'digital' && i.bookId) {
        const book = await Book.findByPk(i.bookId);
        archivoDigital = book?.archivoDigital || null;
      }
      return { ...i, archivoDigital };
    }));

    await Promise.all(itemsWithFiles.map(i => OrderItem.create({
      orderId: order.id,
      bookId: i.bookId,
      titulo: i.titulo,
      autor: i.autor || '',
      precio: Number(i.precio),
      qty: i.qty,
      edicion: i.edicion,
      archivoDigital: i.archivoDigital,
    })));

    // Create MP preference
    const client = getMpClient();
    const preferenceClient = new Preference(client);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    const preference = await preferenceClient.create({
      body: {
        items: items.map(i => ({
          id: String(i.bookId),
          title: i.titulo,
          quantity: Number(i.qty),
          unit_price: Number(i.precio),
          currency_id: 'ARS',
        })),
        payer: {
          name: nombreComprador,
          email: emailComprador.toLowerCase(),
        },
        back_urls: {
          success: `${frontendUrl}/pago/exitoso`,
          failure: `${frontendUrl}/pago/fallido`,
          pending: `${frontendUrl}/pago/pendiente`,
        },
        // auto_return solo funciona con URLs públicas (no localhost)
        // En producción descomentar: auto_return: 'approved',
        notification_url: `${backendUrl}/api/orders/webhook`,
        external_reference: `ORDER-${order.id}`,
        statement_descriptor: 'Ediciones Felicitas',
      },
    });

    await order.update({ mpPreferenceId: preference.id });

    res.status(201).json({
      orderId: order.id,
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ error: 'Error al procesar el pedido' });
  }
};

// POST /api/orders/webhook — MercadoPago payment notifications
const handleWebhook = async (req, res) => {
  const { type, data } = req.body;
  if (type !== 'payment') return res.sendStatus(200);

  try {
    const client = getMpClient();
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: data.id });

    const externalRef = payment.external_reference;
    const orderId = externalRef?.replace('ORDER-', '');
    if (!orderId) return res.sendStatus(200);

    const order = await Order.findByPk(orderId, { include: [{ model: OrderItem }] });
    if (!order) return res.sendStatus(200);

    const mpStatus = payment.status;
    const newStatus =
      mpStatus === 'approved' ? 'approved' :
      mpStatus === 'rejected' ? 'rejected' :
      mpStatus === 'in_process' ? 'in_process' :
      mpStatus === 'cancelled' ? 'cancelled' : 'pending';

    const previousStatus = order.status;
    await order.update({ status: newStatus, mpPaymentId: String(data.id) });

    // Decrement stock only on approval (and only once)
    if (mpStatus === 'approved' && previousStatus !== 'approved') {
      for (const item of order.OrderItems.filter(i => i.edicion === 'fisico')) {
        if (item.bookId) {
          await Book.decrement('stock', { by: item.qty, where: { id: item.bookId } });
          await Book.update({ stock: 0 }, { where: { id: item.bookId, stock: { [Op.lt]: 0 } } });
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(200); // always return 200 to MP to avoid retries
  }
};

// GET /api/orders — admin: all orders with items
const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: OrderItem }],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Error al obtener las órdenes' });
  }
};

// GET /api/orders/my — logged-in user's orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem }],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Error al obtener tus pedidos' });
  }
};

// PATCH /api/orders/:id/status — admin: update order status manually
const updateOrderStatus = async (req, res) => {
  try {
    const { status, cancelNote, cancelReason } = req.body;
    const allowed = ['pending', 'approved', 'in_process', 'rejected', 'cancelled', 'shipped', 'delivered'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem }] });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

    const previousStatus = order.status;
    const updateData = { status };
    if (cancelNote !== undefined) updateData.cancelNote = cancelNote;
    if (cancelReason !== undefined) updateData.cancelReason = cancelReason;
    await order.update(updateData);

    // Decrement stock when manually approving (same logic as webhook)
    if (status === 'approved' && previousStatus !== 'approved') {
      for (const item of order.OrderItems.filter(i => i.edicion === 'fisico')) {
        if (item.bookId) {
          await Book.decrement('stock', { by: item.qty, where: { id: item.bookId } });
          await Book.update({ stock: 0 }, { where: { id: item.bookId, stock: { [Op.lt]: 0 } } });
        }
      }
    }

    res.json(order);
  } catch {
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
};

// POST /api/orders/:id/request-cancel — client requests cancellation within 24h
const requestCancellation = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!['me_equivoque', 'me_arrepenti'].includes(reason)) {
      return res.status(400).json({ error: 'Motivo inválido' });
    }
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    if (order.userId !== req.user.id) return res.status(403).json({ error: 'No autorizado' });

    if (!['pending', 'approved', 'in_process'].includes(order.status)) {
      return res.status(400).json({ error: 'Esta orden no puede cancelarse en su estado actual' });
    }
    const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;
    if (Date.now() - new Date(order.createdAt).getTime() > CANCEL_WINDOW_MS) {
      return res.status(400).json({ error: 'El plazo de 24 horas para solicitar cancelación ha vencido' });
    }
    await order.update({ status: 'cancellation_requested', cancelReason: reason, cancellationRequestedAt: new Date() });
    res.json(order);
  } catch (err) {
    console.error('requestCancellation error:', err);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

// PATCH /api/orders/:id/cancel-decision — admin approves or rejects cancellation request
const handleCancellationRequest = async (req, res) => {
  try {
    const { action, cancelNote } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Acción inválida' });
    }
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    if (order.status !== 'cancellation_requested') {
      return res.status(400).json({ error: 'La orden no tiene una solicitud de cancelación pendiente' });
    }
    const newStatus = action === 'approve' ? 'cancelled' : 'approved';
    const updateData = { status: newStatus, cancelNote: cancelNote || null };
    if (action === 'reject') {
      updateData.cancelReason = null;
      updateData.cancellationRequestedAt = null;
    }
    await order.update(updateData);
    res.json(order);
  } catch (err) {
    console.error('handleCancellationRequest error:', err);
    res.status(500).json({ error: 'Error al procesar la decisión' });
  }
};

// POST /api/orders/:id/confirm-delivery — client confirms they received the order
const confirmDelivery = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    if (order.userId !== req.user.id) return res.status(403).json({ error: 'No autorizado' });
    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'El pedido aún no fue marcado como entregado' });
    }
    await order.update({ clientConfirmedDelivery: true });
    res.json(order);
  } catch (err) {
    console.error('confirmDelivery error:', err);
    res.status(500).json({ error: 'Error al confirmar la entrega' });
  }
};

module.exports = {
  createOrder, handleWebhook, getAdminOrders, getMyOrders,
  updateOrderStatus, requestCancellation, handleCancellationRequest, confirmDelivery,
};
