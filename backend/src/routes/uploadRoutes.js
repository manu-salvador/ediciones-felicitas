const express = require('express');
const router = express.Router();
const { upload, uploadFile } = require('../controllers/uploadController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/upload/libros  — sube portada de libro → devuelve URL pública de R2
// POST /api/upload/digital — sube archivo digital  → devuelve key privada de R2
router.post('/:type', verifyToken, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, uploadFile);

module.exports = router;
