const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  bookId: { type: DataTypes.INTEGER, allowNull: true },
  titulo: { type: DataTypes.STRING, allowNull: false },
  autor: { type: DataTypes.STRING, allowNull: true },
  precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  edicion: { type: DataTypes.STRING, allowNull: false, defaultValue: 'fisico' }, // 'fisico','digital'
  archivoDigital: { type: DataTypes.STRING, allowNull: true },
});

module.exports = OrderItem;
