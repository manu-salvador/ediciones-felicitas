const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { login, forgotPassword, resetPassword, me } = require('../controllers/adminAuthController');
const { verifyToken } = require('../middlewares/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: { success: false, error: 'Demasiados intentos de login. Intentá de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/admin/auth/login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').notEmpty().withMessage('Contraseña requerida'),
  ],
  login
);

// POST /api/admin/auth/forgot-password
router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Email inválido').normalizeEmail()],
  forgotPassword
);

// POST /api/admin/auth/reset-password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token requerido'),
    body('newPassword').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  ],
  resetPassword
);

// GET /api/admin/auth/me
router.get('/me', verifyToken, me);

module.exports = router;
