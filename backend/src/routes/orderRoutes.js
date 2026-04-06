const express = require('express');
const router = express.Router();
const { createOrder, handleWebhook, getAdminOrders, getMyOrders, updateOrderStatus } = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');
const { verifyUserToken } = require('../middleware/userAuthMiddleware');

router.post('/webhook', handleWebhook); // MP calls this (no auth)
router.get('/', verifyToken, getAdminOrders); // admin
router.post('/', verifyUserToken, createOrder); // logged-in user
router.get('/my', verifyUserToken, getMyOrders); // logged-in user
router.patch('/:id/status', verifyToken, updateOrderStatus); // admin

module.exports = router;
