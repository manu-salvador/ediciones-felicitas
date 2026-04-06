const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const sequelize = require('./config/database');
require('dotenv').config();

require('./models/Book');
require('./models/User');

const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');
const userAuthRoutes = require('./routes/userAuthRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Demasiados intentos. Esperá 15 minutos antes de volver a intentarlo.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api', apiLimiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));

// Sanitize req.body — strip < > from all string values
app.use((req, res, next) => {
  const clean = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/[<>]/g, '').trim();
      } else if (typeof obj[key] === 'object') {
        clean(obj[key]);
      }
    }
  };
  clean(req.body);
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userAuthRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => res.send('Ediciones Felicitas API is running'));

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // SQLite deja tablas _backup residuales cuando un ALTER TABLE falla a mitad.
    // Las limpiamos antes de sync para evitar SequelizeUniqueConstraintError.
    if (process.env.NODE_ENV !== 'production') {
      const dialect = sequelize.getDialect();
      if (dialect === 'sqlite') {
        // Deshabilitamos FK constraints para que ALTER TABLE no falle por referencias cruzadas
        await sequelize.query('PRAGMA foreign_keys = OFF');
        await sequelize.query('DROP TABLE IF EXISTS `Users_backup`');
        await sequelize.query('DROP TABLE IF EXISTS `Books_backup`');
        await sequelize.query('DROP TABLE IF EXISTS `Orders_backup`');
        await sequelize.query('DROP TABLE IF EXISTS `OrderItems_backup`');
      }
    }

    await sequelize.sync({ alter: true });

    // Reactivamos FK constraints después del sync
    if (sequelize.getDialect() === 'sqlite') {
      await sequelize.query('PRAGMA foreign_keys = ON');
    }
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();
