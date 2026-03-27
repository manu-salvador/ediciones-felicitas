const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Número legible de pedido: EF-2026-0001
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    // Comprador — puede ser registrado o invitado
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    guestEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },
    guestFirstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    guestLastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    guestPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Envío — solo para pedidos con ítems físicos
    shippingAddress: {
      type: DataTypes.JSONB,
      allowNull: true,
      // Formato: { street, number, floor, apt, city, province, postalCode }
    },
    shippingCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      // ⚠️ TBD: cálculo de costo de envío no definido aún
    },

    // Pago
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    mpPaymentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mpPreferenceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Fulfillment
    fulfillmentStatus: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
      defaultValue: 'pending',
    },
    shippingTrackingCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Totales
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    // Facturación (⚠️ TBD: emisión manual por ahora)
    invoiceRequested: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    invoiceData: {
      type: DataTypes.JSONB,
      allowNull: true,
      // Formato: { cuit, razonSocial, ... }
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'orders',
    timestamps: true,
  }
);

module.exports = Order;
