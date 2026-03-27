const express = require('express');
const router = express.Router();
const { createPreference, webhook } = require('../controllers/mpController');
const { optionalUserToken } = require('../middlewares/auth');

// POST /api/mp/create-preference
router.post('/create-preference', optionalUserToken, createPreference);

// POST /api/mp/webhook — MercadoPago envía notificaciones aquí (sin auth JWT)
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

module.exports = router;
