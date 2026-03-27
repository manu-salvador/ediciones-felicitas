const { Op } = require('sequelize');
const { Order, OrderItem, Book, User } = require('../models');
const { Parser } = require('json2csv');

/**
 * GET /api/admin/orders
 * Lista de pedidos con filtros y paginación
 */
const getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.fulfillmentStatus) where.fulfillmentStatus = req.query.fulfillmentStatus;
    if (req.query.from) where.createdAt = { [Op.gte]: new Date(req.query.from) };
    if (req.query.to) {
      where.createdAt = { ...(where.createdAt || {}), [Op.lte]: new Date(req.query.to) };
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] }],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/orders/:id
 * Detalle de un pedido
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'firstName', 'lastName', 'phone'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'author', 'coverImage'] }],
        },
      ],
    });

    if (!order) return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/orders/:id/fulfillment
 * Actualizar estado de fulfillment e ingresar código de tracking
 */
const updateFulfillment = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Pedido no encontrado' });

    const { fulfillmentStatus, shippingTrackingCode } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(fulfillmentStatus)) {
      return res.status(400).json({ success: false, error: 'Estado de fulfillment inválido' });
    }

    await order.update({ fulfillmentStatus, shippingTrackingCode: shippingTrackingCode || order.shippingTrackingCode });
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/orders/export-csv
 * Exportar pedidos en CSV
 */
const exportCSV = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: User, as: 'user', attributes: ['email', 'firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']],
    });

    const data = orders.map((o) => ({
      orderNumber: o.orderNumber,
      fecha: o.createdAt.toISOString().split('T')[0],
      email: o.user?.email || o.guestEmail,
      nombre: o.user ? `${o.user.firstName} ${o.user.lastName}` : `${o.guestFirstName} ${o.guestLastName}`,
      total: o.total,
      estado: o.status,
      fulfillment: o.fulfillmentStatus,
      tracking: o.shippingTrackingCode || '',
    }));

    const parser = new Parser({ fields: Object.keys(data[0] || {}), delimiter: ';' });
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="pedidos-${Date.now()}.csv"`);
    res.send('\uFEFF' + csv); // BOM para que Excel lo abra correctamente en UTF-8
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrders, getOrderById, updateFulfillment, exportCSV };
