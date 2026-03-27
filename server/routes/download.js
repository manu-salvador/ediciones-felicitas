const express = require('express');
const router = express.Router();
const { downloadDigital } = require('../controllers/downloadController');

// GET /api/download/:token
router.get('/:token', downloadDigital);

module.exports = router;
