const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { register, login, me, updateProfile } = require('../controllers/authController');
const { verifyUserToken } = require('../middlewares/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Demasiados intentos. Intentá de nuevo en 15 minutos.' },
});

// POST /api/auth/register
router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('firstName').notEmpty().trim().withMessage('Nombre requerido'),
    body('lastName').notEmpty().trim().withMessage('Apellido requerido'),
  ],
  register
);

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').notEmpty().withMessage('Contraseña requerida'),
  ],
  login
);

// GET /api/auth/me
router.get('/me', verifyUserToken, me);

// PUT /api/auth/me
router.put('/me', verifyUserToken, updateProfile);

module.exports = router;
