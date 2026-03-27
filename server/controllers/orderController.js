const { Op } = require('sequelize');
const { Order, OrderItem, Book, User } = require('../models');
const generateOrderNumber = require('../utils/generateOrderNumber');

/**
 * POST /api/orders
 * Crear un nuevo pedido (checkout público — guest o usuario registrado)
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      // Comprador
      guestEmail, guestFirstName, guestLastName, guestPhone,
      // Envío
      shippingAddress,
      // Factura
      invoiceRequested, invoiceData,
      // Notas
      notes,
      // Items: [{ bookId, type: 'physical'|'digital', quantity }]
      items,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'El carrito está vacío' });
    }

    // Verificar que todos los libros existan y tengan stock
    const bookIds = items.map((i) => i.bookId);
    const books = await Book.findAll({ where: { id: bookIds, isActive: true } });

    if (books.length !== bookIds.length) {
      return res.status(400).json({ success: false, error: 'Uno o más libros no están disponibles' });
    }

    const bookMap = Object.fromEntries(books.map((b) => [b.id, b]));

    // Validar stock y construir items
    const orderItemsData = [];
    let subtotal = 0;
    let hasPhysical = false;

    for (const item of items) {
      const book = bookMap[item.bookId];

      if (item.type === 'physical') {
        if (!book.hasPhysical) {
          return res.status(400).json({ success: false, error: `"${book.title}" no tiene versión física` });
        }
        if (book.physicalStock < item.quantity) {
          return res.status(400).json({ success: false, error: `Stock insuficiente para "${book.title}"` });
        }
        hasPhysical = true;
      }

      if (item.type === 'digital') {
        if (!book.hasDigital) {
          return res.status(400).json({ success: false, error: `"${book.title}" no tiene versión digital` });
        }
      }

      const unitPrice = item.type === 'physical' ? parseFloat(book.physicalPrice) : parseFloat(book.digitalPrice);
      const itemSubtotal = unitPrice * item.quantity;

      orderItemsData.push({
        bookId: book.id,
        type: item.type,
        quantity: item.quantity,
        unitPrice,
        subtotal: itemSubtotal,
      });

      subtotal += itemSubtotal;
    }

    // Validar dirección de envío si hay ítems físicos
    if (hasPhysical && !shippingAddress) {
      return res.status(400).json({ success: false, error: 'Dirección de envío requerida para libros físicos' });
    }

    const shippingCost = 0; // ⚠️ TBD: cálculo de costo de envío
    const total = subtotal + shippingCost;

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      userId: req.user?.id || null,
      guestEmail: req.user ? null : guestEmail,
      guestFirstName: req.user ? null : guestFirstName,
      guestLastName: req.user ? null : guestLastName,
      guestPhone: req.user ? null : guestPhone,
      shippingAddress: hasPhysical ? shippingAddress : null,
      shippingCost,
      subtotal,
      total,
      invoiceRequested: invoiceRequested || false,
      invoiceData: invoiceRequested ? invoiceData : null,
      notes,
    });

    // Crear los ítems del pedido
    await OrderItem.bulkCreate(orderItemsData.map((item) => ({ ...item, orderId: order.id })));

    res.status(201).json({
      success: true,
      data: { orderId: order.id, orderNumber: order.orderNumber, total: order.total },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder };
