const sequelize = require('../config/database');

const Book = require('./Book');
const Category = require('./Category');
const BookCategory = require('./BookCategory');
const User = require('./User');
const Admin = require('./Admin');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// ─── Book ↔ Category (many-to-many) ─────────────────────────────────────────
Book.belongsToMany(Category, { through: BookCategory, foreignKey: 'bookId', as: 'categories' });
Category.belongsToMany(Book, { through: BookCategory, foreignKey: 'categoryId', as: 'books' });

// ─── User ↔ Order (one-to-many) ──────────────────────────────────────────────
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ─── Order ↔ OrderItem (one-to-many) ─────────────────────────────────────────
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// ─── Book ↔ OrderItem (one-to-many) ──────────────────────────────────────────
Book.hasMany(OrderItem, { foreignKey: 'bookId', as: 'orderItems' });
OrderItem.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

module.exports = {
  sequelize,
  Book,
  Category,
  BookCategory,
  User,
  Admin,
  Order,
  OrderItem,
};
