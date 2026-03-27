const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookCategory = sequelize.define(
  'BookCategory',
  {
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'books', key: 'id' },
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'categories', key: 'id' },
    },
  },
  {
    tableName: 'book_categories',
    timestamps: false,
  }
);

module.exports = BookCategory;
