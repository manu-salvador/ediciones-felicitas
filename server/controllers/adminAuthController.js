const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Admin } = require('../models');

const BCRYPT_ROUNDS = 12;

/**
 * POST /api/admin/auth/login
 * Login de admins con email y contraseña
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ where: { email: email.toLowerCase() } });
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY || '24h',
    });

    res.json({
      success: true,
      data: { token, admin: { id: admin.id, email: admin.email, name: admin.name } },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/auth/forgot-password
 * Genera un token de reset y lo guarda hasheado en la DB
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ where: { email: email.toLowerCase() } });

    // Responder igual aunque el admin no exista (evita enumeración de emails)
    if (!admin) {
      return res.json({ success: true, message: 'Si el email existe, recibirás el link de reset.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await admin.update({ resetToken: hashedToken, resetTokenExpiry: expiry });

    // ⚠️ TBD: enviar email con el link usando el servicio de email (Resend o SendGrid)
    // Por ahora se loguea en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Reset token para ${email}: ${rawToken}`);
      console.log(`[DEV] Link: http://localhost:5173/admin/reset-password?token=${rawToken}`);
    }

    res.json({ success: true, message: 'Si el email existe, recibirás el link de reset.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/auth/reset-password
 * Valida el token y actualiza la contraseña
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const admin = await Admin.findOne({
      where: {
        resetToken: hashedToken,
      },
    });

    if (!admin || admin.resetTokenExpiry < new Date()) {
      return res.status(400).json({ success: false, error: 'Token inválido o expirado' });
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await admin.update({
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    });

    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/auth/me
 * Retorna los datos del admin autenticado
 */
const me = async (req, res) => {
  res.json({ success: true, data: req.admin });
};

module.exports = { login, forgotPassword, resetPassword, me };
