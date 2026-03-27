const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/orderController');
const { optionalUserToken } = require('../middlewares/auth');

// POST /api/orders — guest o usuario registrado
router.post('/', optionalUserToken, createOrder);

module.exports = router;
