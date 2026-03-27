const { Op } = require('sequelize');
const { Book, Category } = require('../models');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/books
 * Lista pública de libros activos con filtro opcional por categoría y paginación
 */
const getBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 12, 48);
    const offset = (page - 1) * limit;
    const categorySlug = req.query.category;

    const whereClause = { isActive: true };

    const includeClause = [
      {
        model: Category,
        as: 'categories',
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] },
        ...(categorySlug ? { where: { slug: categorySlug } } : {}),
      },
    ];

    const { count, rows } = await Book.findAndCountAll({
      where: whereClause,
      include: includeClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['digitalFile'] }, // No exponer path del PDF en listado
      distinct: true,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/books/:slug
 * Detalle público de un libro por slug
 */
const getBookBySlug = async (req, res, next) => {
  try {
    const book = await Book.findOne({
      where: { slug: req.params.slug, isActive: true },
      include: [{ model: Category, as: 'categories', attributes: ['id', 'name', 'slug'], through: { attributes: [] } }],
      attributes: { exclude: ['digitalFile'] },
    });

    if (!book) {
      return res.status(404).json({ success: false, error: 'Libro no encontrado' });
    }

    res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/books
 * Crear un nuevo libro (admin)
 */
const createBook = async (req, res, next) => {
  try {
    const {
      title, author, editorial, year, description, language, isbn,
      hasPhysical, hasDigital, physicalPrice, digitalPrice,
      physicalStock, categoryIds,
    } = req.body;

    const bookData = {
      title, author, editorial, year, description, language, isbn,
      hasPhysical: hasPhysical === 'true' || hasPhysical === true,
      hasDigital: hasDigital === 'true' || hasDigital === true,
      physicalPrice: physicalPrice ? parseFloat(physicalPrice) : null,
      digitalPrice: digitalPrice ? parseFloat(digitalPrice) : null,
      physicalStock: physicalStock ? parseInt(physicalStock) : 0,
    };

    if (req.files?.coverImage?.[0]) {
      bookData.coverImage = `covers/${req.files.coverImage[0].filename}`;
    }
    if (req.files?.digitalFile?.[0]) {
      bookData.digitalFile = `digital/${req.files.digitalFile[0].filename}`;
    }

    const book = await Book.create(bookData);

    // Asignar categorías si se enviaron
    if (categoryIds) {
      const ids = Array.isArray(categoryIds) ? categoryIds : JSON.parse(categoryIds);
      const categories = await Category.findAll({ where: { id: ids } });
      await book.setCategories(categories);
    }

    const fullBook = await Book.findByPk(book.id, {
      include: [{ model: Category, as: 'categories', attributes: ['id', 'name', 'slug'], through: { attributes: [] } }],
    });

    res.status(201).json({ success: true, data: fullBook });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/books/:id
 * Actualizar un libro (admin)
 */
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ success: false, error: 'Libro no encontrado' });

    const {
      title, author, editorial, year, description, language, isbn,
      hasPhysical, hasDigital, physicalPrice, digitalPrice,
      physicalStock, categoryIds,
    } = req.body;

    const updates = {
      title, author, editorial, year, description, language, isbn,
      hasPhysical: hasPhysical !== undefined ? (hasPhysical === 'true' || hasPhysical === true) : book.hasPhysical,
      hasDigital: hasDigital !== undefined ? (hasDigital === 'true' || hasDigital === true) : book.hasDigital,
      physicalPrice: physicalPrice !== undefined ? parseFloat(physicalPrice) : book.physicalPrice,
      digitalPrice: digitalPrice !== undefined ? parseFloat(digitalPrice) : book.digitalPrice,
      physicalStock: physicalStock !== undefined ? parseInt(physicalStock) : book.physicalStock,
    };

    // Si se sube una nueva portada, eliminar la anterior
    if (req.files?.coverImage?.[0]) {
      if (book.coverImage) {
        const oldPath = path.join(process.env.UPLOADS_PATH || './uploads', book.coverImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.coverImage = `covers/${req.files.coverImage[0].filename}`;
    }

    if (req.files?.digitalFile?.[0]) {
      if (book.digitalFile) {
        const oldPath = path.join(process.env.UPLOADS_PATH || './uploads', book.digitalFile);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.digitalFile = `digital/${req.files.digitalFile[0].filename}`;
    }

    await book.update(updates);

    if (categoryIds !== undefined) {
      const ids = Array.isArray(categoryIds) ? categoryIds : JSON.parse(categoryIds);
      const categories = await Category.findAll({ where: { id: ids } });
      await book.setCategories(categories);
    }

    const fullBook = await Book.findByPk(book.id, {
      include: [{ model: Category, as: 'categories', attributes: ['id', 'name', 'slug'], through: { attributes: [] } }],
    });

    res.json({ success: true, data: fullBook });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/books/:id
 * Eliminar un libro (admin) — soft delete vía isActive
 */
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ success: false, error: 'Libro no encontrado' });

    await book.update({ isActive: false });
    res.json({ success: true, message: 'Libro desactivado correctamente' });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/books/:id/toggle-active
 * Activar / desactivar un libro
 */
const toggleActive = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ success: false, error: 'Libro no encontrado' });

    await book.update({ isActive: !book.isActive });
    res.json({ success: true, data: { isActive: book.isActive } });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/books/:id/stock
 * Actualizar stock físico de un libro
 */
const updateStock = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ success: false, error: 'Libro no encontrado' });

    const { physicalStock } = req.body;
    if (physicalStock === undefined || physicalStock < 0) {
      return res.status(400).json({ success: false, error: 'Stock inválido' });
    }

    await book.update({ physicalStock: parseInt(physicalStock) });
    res.json({ success: true, data: { physicalStock: book.physicalStock } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/books
 * Lista todos los libros (activos e inactivos) para el panel admin
 */
const adminGetBooks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    const { count, rows } = await Book.findAndCountAll({
      include: [{ model: Category, as: 'categories', attributes: ['id', 'name'], through: { attributes: [] } }],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBooks, getBookBySlug, createBook, updateBook, deleteBook, toggleActive, updateStock, adminGetBooks };
