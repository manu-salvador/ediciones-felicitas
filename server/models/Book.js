const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define(
  'Book',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    editorial: {
      type: DataTypes.STRING,
      defaultValue: 'Ediciones Felicitas',
    },
    year: {
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.TEXT,
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'Español',
    },
    isbn: {
      type: DataTypes.STRING,
    },
    coverImage: {
      type: DataTypes.STRING, // path relativo al Volume
    },
    hasPhysical: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    hasDigital: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    physicalPrice: {
      type: DataTypes.DECIMAL(10, 2),
    },
    digitalPrice: {
      type: DataTypes.DECIMAL(10, 2), // ⚠️ TBD: puede ser igual o distinto al físico
    },
    physicalStock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    digitalStock: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1 = infinito (⚠️ TBD: confirmar con cliente)
    },
    digitalFile: {
      type: DataTypes.STRING, // path al PDF en el Volume
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'books',
    timestamps: true,
  }
);

// Genera el slug a partir del título antes de crear/actualizar
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
};

Book.beforeCreate((book) => {
  if (!book.slug) {
    book.slug = generateSlug(book.title);
  }
});

Book.beforeUpdate((book) => {
  if (book.changed('title') && !book.changed('slug')) {
    book.slug = generateSlug(book.title);
  }
});

module.exports = Book;
