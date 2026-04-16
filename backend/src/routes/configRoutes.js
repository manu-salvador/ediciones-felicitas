const express = require('express');
const router = express.Router();
const Config = require('../models/Config');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/config/shipping — public, returns current shipping cost
router.get('/shipping', async (req, res) => {
  try {
    const row = await Config.findByPk('shipping_cost');
    const shippingCost = row ? Number(row.value) : 0;
    res.json({ shippingCost });
  } catch {
    res.status(500).json({ error: 'Error al obtener tarifa de envío' });
  }
});

// PATCH /api/config/shipping — admin only
router.patch('/shipping', verifyToken, async (req, res) => {
  try {
    const cost = Number(req.body.shippingCost);
    if (isNaN(cost) || cost < 0) return res.status(400).json({ error: 'Tarifa inválida' });
    await Config.upsert({ key: 'shipping_cost', value: String(cost) });
    res.json({ shippingCost: cost });
  } catch {
    res.status(500).json({ error: 'Error al actualizar tarifa de envío' });
  }
});

module.exports = router;
