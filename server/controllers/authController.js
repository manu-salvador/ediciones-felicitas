const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const BCRYPT_ROUNDS = 12;

/**
 * POST /api/auth/register
 * Registro de compradores
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const exists = await User.findOne({ where: { email: email.toLowerCase() } });
    if (exists) {
      return res.status(409).json({ success: false, error: 'Ya existe una cuenta con ese email' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      phone,
    });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY || '24h',
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login de compradores registrados
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ success: false, error: 'Esta cuenta no tiene contraseña configurada' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY || '24h',
    });

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Retorna los datos del comprador autenticado
 */
const me = async (req, res) => {
  res.json({ success: true, data: req.user });
};

/**
 * PUT /api/auth/me
 * Actualiza los datos del comprador autenticado
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address, email } = req.body;
    
    // El usuario autenticado viene de verifyUserToken en req.user
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email: email.toLowerCase() } });
      if (exists) return res.status(409).json({ success: false, error: 'El email ya está en uso' });
      user.email = email.toLowerCase();
    }

    await user.update({
      firstName,
      lastName,
      phone,
      address,
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, me, updateProfile };
