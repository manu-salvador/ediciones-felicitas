const Book = require('../models/Book');

const getBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: { activo: true },
      order: [['titulo', 'ASC']],
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los libros' });
  }
};

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({ order: [['titulo', 'ASC']] });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los libros' });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Libro no encontrado' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el libro' });
  }
};

const createBook = async (req, res) => {
  try {
    const { titulo, isbn, precio, autor, categoria, imagen, tieneDigital } = req.body;
    if (!titulo || !precio) {
      return res.status(400).json({ error: 'Título y precio son obligatorios' });
    }
    const book = await Book.create({ titulo, isbn, precio, autor, categoria, imagen, tieneDigital });
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
    const { titulo, isbn, precio, autor, categoria, imagen, activo, tieneDigital } = req.body;
    await book.update({ titulo, isbn, precio, autor, categoria, imagen, activo, tieneDigital });
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
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el libro' });
  }
};

module.exports = { getBooks, getAllBooks, getBookById, createBook, updateBook, deleteBook };
