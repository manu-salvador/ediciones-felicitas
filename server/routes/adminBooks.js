const express = require('express');
const router = express.Router();
const {
  createBook, updateBook, deleteBook, toggleActive, updateStock, adminGetBooks,
} = require('../controllers/bookController');
const { verifyToken } = require('../middlewares/auth');
const { uploadBookFiles } = require('../middlewares/upload');
const { validateBook } = require('../middlewares/validate');

// Todas las rutas admin requieren autenticación
router.use(verifyToken);

// GET /api/admin/books
router.get('/', adminGetBooks);

// POST /api/admin/books
router.post('/', uploadBookFiles.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'digitalFile', maxCount: 1 },
]), validateBook(true), createBook);

// PUT /api/admin/books/:id
router.put('/:id', uploadBookFiles.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'digitalFile', maxCount: 1 },
]), validateBook(false), updateBook);

// DELETE /api/admin/books/:id
router.delete('/:id', deleteBook);

// PATCH /api/admin/books/:id/toggle-active
router.patch('/:id/toggle-active', toggleActive);

// PATCH /api/admin/books/:id/stock
router.patch('/:id/stock', updateStock);

module.exports = router;
