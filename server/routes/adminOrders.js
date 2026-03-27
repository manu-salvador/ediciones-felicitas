const express = require('express');
const router = express.Router();
const { getOrders, getOrderById, updateFulfillment, exportCSV } = require('../controllers/adminOrderController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

// GET /api/admin/orders
router.get('/', getOrders);

// GET /api/admin/orders/export-csv  — debe ir antes de /:id para no confundir el param
router.get('/export-csv', exportCSV);

// GET /api/admin/orders/:id
router.get('/:id', getOrderById);

// PATCH /api/admin/orders/:id/fulfillment
router.patch('/:id/fulfillment', updateFulfillment);

module.exports = router;
