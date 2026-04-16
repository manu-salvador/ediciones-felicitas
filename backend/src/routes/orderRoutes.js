const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { createOrder, handleWebhook, getAdminOrders, getMyOrders, updateOrderStatus, requestCancellation, handleCancellationRequest, confirmDelivery, downloadDigitalFile, deleteOrder } = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');
const { verifyUserToken } = require('../middleware/userAuthMiddleware');

// Máx 5 descargas por usuario+item por hora
// Cubre el caso de token robado o uso abusivo
const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => `dl-${req.user?.id}-${req.params.itemId}`,
  message: { error: 'Demasiadas descargas. Intentá de nuevo en una hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/webhook', handleWebhook);
router.get('/', verifyToken, getAdminOrders);
router.post('/', verifyUserToken, createOrder);
router.get('/my', verifyUserToken, getMyOrders);
router.delete('/:id', verifyToken, deleteOrder);
router.patch('/:id/status', verifyToken, updateOrderStatus);
router.patch('/:id/cancel-decision', verifyToken, handleCancellationRequest);
router.post('/:id/request-cancel', verifyUserToken, requestCancellation);
router.post('/:id/confirm-delivery', verifyUserToken, confirmDelivery);
router.get('/:id/download/:itemId', verifyUserToken, downloadLimiter, downloadDigitalFile);

module.exports = router;
