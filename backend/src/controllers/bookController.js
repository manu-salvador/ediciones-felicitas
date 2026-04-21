const Book = require('../models/Book');

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const generateUniqueSlug = async (titulo, excludeId = null) => {
  const base = slugify(titulo);
  let slug = base;
  let i = 2;
  while (true) {
    const where = { slug };
    if (excludeId) where.id = { [require('sequelize').Op.ne]: excludeId };
    const existing = await Book.findOne({ where });
    if (!existing) return slug;
    slug = `${base}-${i++}`;
  }
};

const getBooks = async (req, res) => {
  try {
    const books = await Book.findAll({ where: { activo: true }, order: [['titulo', 'ASC']] });
    res.json(books);
  } catch {
    res.status(500).json({ error: 'Error al obtener los libros' });
  }
};

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({ order: [['titulo', 'ASC']] });
    res.json(books);
  } catch {
    res.status(500).json({ error: 'Error al obtener los libros' });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Libro no encontrado' });
    res.json(book);
  } catch {
    res.status(500).json({ error: 'Error al obtener el libro' });
  }
};

const getBookBySlug = async (req, res) => {
  try {
    const book = await Book.findOne({ where: { slug: req.params.slug, activo: true } });
    if (!book) return res.status(404).json({ error: 'Libro no encontrado' });
    res.json(book);
  } catch {
    res.status(500).json({ error: 'Error al obtener el libro' });
  }
};

const createBook = async (req, res) => {
  try {
    const { titulo, isbn, precio, autor, categoria, imagen, tieneDigital, archivoDigital, stock, paginas } = req.body;
    if (!titulo || !precio) return res.status(400).json({ error: 'Título y precio son obligatorios' });
    const slug = await generateUniqueSlug(titulo);
    const paginasVal = paginas === '' || paginas === undefined ? null : Number(paginas);
    const book = await Book.create({ titulo, isbn, precio, autor, categoria, imagen, tieneDigital, archivoDigital, slug, stock: stock ?? 0, paginas: paginasVal });
    res.status(201).json(book);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'El ISBN ya existe' });
    }
    res.status(500).json({ error: 'Error al crear el libro' });
  }
};

const updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Libro no encontrado' });
    const { titulo, isbn, precio, autor, categoria, imagen, activo, tieneDigital, archivoDigital, stock, paginas } = req.body;
    const newSlug = titulo && titulo !== book.titulo
      ? await generateUniqueSlug(titulo, book.id)
      : book.slug;
    const paginasVal = paginas === '' || paginas === undefined ? null : Number(paginas);
    const stockVal = stock === '' || stock === undefined ? null : Number(stock);
    await book.update({ titulo, isbn, precio, autor, categoria, imagen, activo, tieneDigital, archivoDigital, slug: newSlug, ...(stockVal !== null && { stock: stockVal }), paginas: paginasVal });
    res.json(book);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'El ISBN ya existe' });
    }
    res.status(500).json({ error: 'Error al actualizar el libro' });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Libro no encontrado' });
    await book.update({ activo: false });
    res.json({ message: 'Libro desactivado correctamente' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar el libro' });
  }
};

module.exports = { getBooks, getAllBooks, getBookById, getBookBySlug, createBook, updateBook, deleteBook };
