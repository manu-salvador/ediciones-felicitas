const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Book = sequelize.define('Book', {
  titulo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isbn: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  autor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tieneDigital: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Book;
