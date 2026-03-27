const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

/**
 * Verifica el token JWT enviado en el header Authorization.
 * Agrega req.admin con los datos del admin autenticado.
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token de autenticación requerido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el admin aún exista en la DB
    const admin = await Admin.findByPk(decoded.id, {
      attributes: ['id', 'email', 'name'],
    });

    if (!admin) {
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expirado' });
    }
    return res.status(401).json({ success: false, error: 'Token inválido' });
  }
};

/**
 * Verifica el token JWT de un comprador registrado.
 * Agrega req.user con los datos del usuario autenticado.
 */
const verifyUserToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token de autenticación requerido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { User } = require('../models');
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'isActive'],
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expirado' });
    }
    return res.status(401).json({ success: false, error: 'Token inválido' });
  }
};

/**
 * Middleware opcional — no falla si no hay token.
 * Si el token es válido, agrega req.user. Útil para endpoints mixtos (guest/user).
 */
const optionalUserToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { User } = require('../models');
    const user = await User.findByPk(decoded.id);
    if (user && user.isActive) req.user = user;
  } catch {
    // Token inválido o expirado — continuar como invitado
  }
  next();
};

module.exports = { verifyToken, verifyUserToken, optionalUserToken };
