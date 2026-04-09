const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res) => {
  try {
    const { nombre, email, password, calle, numero, piso, ciudad } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }
    if (!calle || !numero || !ciudad) {
      return res.status(400).json({ error: 'Calle, número y ciudad son obligatorios' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe una cuenta con ese email' });
    }
    const pisoParte = piso ? ` ${piso}` : '';
    const direccion = `${calle} ${numero}${pisoParte} - ${ciudad}`;
    const user = await User.create({ nombre, email, password, direccion, ciudad });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: user.toSafeJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user.toSafeJSON());
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { nombre, email, telefono, direccion } = req.body;

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(400).json({ error: 'Ese email ya está en uso' });
    }

    const { ciudad } = req.body;
    await user.update({
      nombre: nombre || user.nombre,
      email: email || user.email,
      telefono: telefono !== undefined ? telefono : user.telefono,
      direccion: direccion !== undefined ? direccion : user.direccion,
      ciudad: ciudad !== undefined ? ciudad : user.ciudad,
    });

    res.json(user.toSafeJSON());
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Se requieren ambas contraseñas' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    const isValid = await user.checkPassword(currentPassword);
    if (!isValid) return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    await user.update({ password: await bcrypt.hash(newPassword, 10) });
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch {
    res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Se requiere la contraseña para confirmar' });
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    const isValid = await user.checkPassword(password);
    if (!isValid) return res.status(400).json({ error: 'Contraseña incorrecta' });
    await user.destroy();
    res.json({ message: 'Cuenta eliminada correctamente' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar la cuenta' });
  }
};

module.exports = { register, login, me, updateProfile, changePassword, deleteAccount };
