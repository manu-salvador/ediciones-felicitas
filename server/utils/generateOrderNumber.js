const { Order } = require('../models');

/**
 * Genera un número de pedido legible con el formato EF-AÑO-NNNN.
 * Ejemplo: EF-2026-0001
 */
const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `EF-${year}-`;

  // Cuenta los pedidos del año actual para determinar el siguiente número
  const count = await Order.count({
    where: {
      orderNumber: {
        [require('sequelize').Op.like]: `${prefix}%`,
      },
    },
  });

  const nextNumber = String(count + 1).padStart(4, '0');
  return `${prefix}${nextNumber}`;
};

module.exports = generateOrderNumber;
