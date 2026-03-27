const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { register, login, me, updateProfile } = require('../controllers/authController');
const { verifyUserToken } = require('../middlewares/auth');
const { validateUpdateProfile } = require('../middlewares/validate');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Demasiados intentos. Intentá de nuevo en 15 minutos.' },
});

// Middleware para capturar errores de express-validator
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }
  next();
};

// POST /api/auth/register
router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail().isLength({ max: 120 }),
    body('password').isLength({ min: 6, max: 128 }).withMessage('La contraseña debe tener entre 6 y 128 caracteres'),
    body('firstName').notEmpty().trim().isLength({ max: 60 }).withMessage('Nombre requerido (máx. 60 caracteres)').escape(),
    body('lastName').notEmpty().trim().isLength({ max: 60 }).withMessage('Apellido requerido (máx. 60 caracteres)').escape(),
    body('phone').optional().trim().isLength({ max: 20 }).withMessage('Teléfono demasiado largo'),
  ],
  handleValidation,
  register
);

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail().isLength({ max: 120 }),
    body('password').notEmpty().isLength({ max: 128 }).withMessage('Contraseña requerida'),
  ],
  handleValidation,
  login
);

// GET /api/auth/me
router.get('/me', verifyUserToken, me);

// PUT /api/auth/me — con validación server-side
router.put('/me', verifyUserToken, validateUpdateProfile, updateProfile);

module.exports = router;
