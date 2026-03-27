const { Category } = require('../models');

const generateSlug = (name) =>
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

/**
 * GET /api/categories
 * Lista todas las categorías (público)
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/categories
 */
const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = generateSlug(name);
    const category = await Category.create({ name, slug });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/categories/:id
 */
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, error: 'Categoría no encontrada' });

    const { name } = req.body;
    await category.update({ name, slug: generateSlug(name) });
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/categories/:id
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, error: 'Categoría no encontrada' });

    await category.destroy();
    res.json({ success: true, message: 'Categoría eliminada' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
