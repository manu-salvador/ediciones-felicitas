const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  status: {
    type: DataTypes.STRING, // 'pending','approved','in_process','rejected','cancelled'
    defaultValue: 'pending',
  },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  mpPreferenceId: { type: DataTypes.STRING, allowNull: true },
  mpPaymentId: { type: DataTypes.STRING, allowNull: true },
  tipoEntrega: { type: DataTypes.STRING, allowNull: false }, // 'fisico','digital','mixto'
  direccionEnvio: { type: DataTypes.TEXT, allowNull: true },
  nombreComprador: { type: DataTypes.STRING, allowNull: false },
  emailComprador: { type: DataTypes.STRING, allowNull: false },
  telefonoComprador: { type: DataTypes.STRING, allowNull: true },
  userId: { type: DataTypes.INTEGER, allowNull: true },
});

module.exports = Order;
