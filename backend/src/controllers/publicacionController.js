const Publicacion = require('../models/Publicacion');
const { Op } = require('sequelize');

// GET /api/publicaciones?page=1&limit=9
const getPublicaciones = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 9);
    const offset = (page - 1) * limit;

    const { count, rows } = await Publicacion.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      total: count,
      pages: Math.ceil(count / limit),
      page,
      data: rows,
    });
  } catch (err) {
    console.error('getPublicaciones error:', err);
    res.status(500).json({ error: 'Error al obtener publicaciones' });
  }
};

// GET /api/publicaciones/:id
const getPublicacion = async (req, res) => {
  try {
    const pub = await Publicacion.findByPk(req.params.id);
    if (!pub) return res.status(404).json({ error: 'Publicación no encontrada' });
    res.json(pub);
  } catch (err) {
    console.error('getPublicacion error:', err);
    res.status(500).json({ error: 'Error al obtener la publicación' });
  }
};

// POST /api/publicaciones — admin only
const createPublicacion = async (req, res) => {
  try {
    const { titulo, texto, foto } = req.body;
    if (!titulo?.trim()) return res.status(400).json({ error: 'El título es obligatorio' });
    if (!texto?.trim())  return res.status(400).json({ error: 'El texto es obligatorio' });

    const pub = await Publicacion.create({ titulo: titulo.trim(), texto: texto.trim(), foto: foto || null });
    res.status(201).json(pub);
  } catch (err) {
    console.error('createPublicacion error:', err);
    res.status(500).json({ error: 'Error al crear la publicación' });
  }
};

// PUT /api/publicaciones/:id — admin only
const updatePublicacion = async (req, res) => {
  try {
    const pub = await Publicacion.findByPk(req.params.id);
    if (!pub) return res.status(404).json({ error: 'Publicación no encontrada' });

    const { titulo, texto, foto } = req.body;
    if (titulo !== undefined && !titulo.trim()) return res.status(400).json({ error: 'El título no puede estar vacío' });
    if (texto  !== undefined && !texto.trim())  return res.status(400).json({ error: 'El texto no puede estar vacío' });

    await pub.update({
      ...(titulo !== undefined && { titulo: titulo.trim() }),
      ...(texto  !== undefined && { texto: texto.trim() }),
      ...(foto   !== undefined && { foto: foto || null }),
    });
    res.json(pub);
  } catch (err) {
    console.error('updatePublicacion error:', err);
    res.status(500).json({ error: 'Error al actualizar la publicación' });
  }
};

// DELETE /api/publicaciones/:id — admin only
const deletePublicacion = async (req, res) => {
  try {
    const pub = await Publicacion.findByPk(req.params.id);
    if (!pub) return res.status(404).json({ error: 'Publicación no encontrada' });
    await pub.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error('deletePublicacion error:', err);
    res.status(500).json({ error: 'Error al eliminar la publicación' });
  }
};

module.exports = { getPublicaciones, getPublicacion, createPublicacion, updatePublicacion, deletePublicacion };
