const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  status: {
    type: DataTypes.STRING, // 'pending','approved','in_process','rejected','cancelled'
    defaultValue: 'pending',
  },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  costoEnvio: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  mpPreferenceId: { type: DataTypes.STRING, allowNull: true },
  mpPaymentId: { type: DataTypes.STRING, allowNull: true },
  tipoEntrega: { type: DataTypes.STRING, allowNull: false }, // 'fisico','digital','mixto'
  direccionEnvio: { type: DataTypes.TEXT, allowNull: true },
  nombreComprador: { type: DataTypes.STRING, allowNull: false },
  emailComprador: { type: DataTypes.STRING, allowNull: false },
  telefonoComprador: { type: DataTypes.STRING, allowNull: true },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  cancelReason: { type: DataTypes.STRING, allowNull: true },
  cancelNote: { type: DataTypes.TEXT, allowNull: true },
  cancellationRequestedAt: { type: DataTypes.DATE, allowNull: true },
  clientConfirmedDelivery: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = Order;
