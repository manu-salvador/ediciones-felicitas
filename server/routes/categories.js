const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { verifyToken } = require('../middlewares/auth');

// GET /api/categories — público
router.get('/', getCategories);

// Admin
router.post('/', verifyToken, [body('name').notEmpty().trim().withMessage('Nombre requerido')], createCategory);
router.put('/:id', verifyToken, [body('name').notEmpty().trim().withMessage('Nombre requerido')], updateCategory);
router.delete('/:id', verifyToken, deleteCategory);

module.exports = router;
