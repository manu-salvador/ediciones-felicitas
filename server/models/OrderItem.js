const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'orders', key: 'id' },
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'books', key: 'id' },
    },
    type: {
      type: DataTypes.ENUM('physical', 'digital'),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    // Precio unitario al momento de la compra (snapshot — no cambia aunque cambie el libro)
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    // Solo para ítems digitales
    downloadToken: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    downloadTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      // ⚠️ TBD: valor de expiración a confirmar con cliente
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    maxDownloads: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      // ⚠️ TBD: confirmar límite con cliente
    },
  },
  {
    tableName: 'order_items',
    timestamps: true,
  }
);

module.exports = OrderItem;
