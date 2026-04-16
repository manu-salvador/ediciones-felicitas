const express = require('express');
const router = express.Router();
const { getPublicaciones, getPublicacion, createPublicacion, updatePublicacion, deletePublicacion } = require('../controllers/publicacionController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getPublicaciones);
router.get('/:id', getPublicacion);

// Admin-only routes
router.post('/', verifyToken, createPublicacion);
router.put('/:id', verifyToken, updatePublicacion);
router.delete('/:id', verifyToken, deletePublicacion);

module.exports = router;
