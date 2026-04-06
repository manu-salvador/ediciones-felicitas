const express = require('express');
const router = express.Router();
const { createOrder, handleWebhook, getAdminOrders, getMyOrders, updateOrderStatus, requestCancellation, handleCancellationRequest, confirmDelivery } = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');
const { verifyUserToken } = require('../middleware/userAuthMiddleware');

router.post('/webhook', handleWebhook);
router.get('/', verifyToken, getAdminOrders);
router.post('/', verifyUserToken, createOrder);
router.get('/my', verifyUserToken, getMyOrders);
router.patch('/:id/status', verifyToken, updateOrderStatus);
router.patch('/:id/cancel-decision', verifyToken, handleCancellationRequest);
router.post('/:id/request-cancel', verifyUserToken, requestCancellation);
router.post('/:id/confirm-delivery', verifyUserToken, confirmDelivery);

module.exports = router;
