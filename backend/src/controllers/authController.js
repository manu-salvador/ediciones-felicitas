const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Config = require('../models/Config');

const ADMIN_PASS_KEY = 'admin_password_hash';

const getAdminPasswordHash = async () => {
  const row = await Config.findByPk(ADMIN_PASS_KEY);
  return row?.value || null;
};

const login = async (req, res) => {
  const { usuario, password } = req.body;
  const validUser = process.env.ADMIN_USER;
  const validPass = process.env.ADMIN_PASSWORD;

  if (usuario !== validUser) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const overrideHash = await getAdminPasswordHash();
  const passwordOk = overrideHash
    ? await bcrypt.compare(password, overrideHash)
    : password === validPass;

  if (!passwordOk) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign(
    { usuario },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token, usuario });
};

const changeAdminPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  const validPass = process.env.ADMIN_PASSWORD;
  const overrideHash = await getAdminPasswordHash();
  const currentOk = overrideHash
    ? await bcrypt.compare(currentPassword, overrideHash)
    : currentPassword === validPass;

  if (!currentOk) {
    return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await Config.upsert({ key: ADMIN_PASS_KEY, value: newHash });
  res.json({ ok: true });
};

module.exports = { login, changeAdminPassword };
