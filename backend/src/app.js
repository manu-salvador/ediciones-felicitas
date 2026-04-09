const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Validate required environment variables before anything else
const REQUIRED_ENV = [
  'JWT_SECRET', 'ADMIN_USER', 'ADMIN_PASSWORD',
  'MP_ACCESS_TOKEN',
  'R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL',
];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`ERROR: Faltan variables de entorno requeridas: ${missingEnv.join(', ')}`);
  process.exit(1);
}
if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  console.error('ERROR: FRONTEND_URL es requerido en producción');
  process.exit(1);
}

const sequelize = require('./config/database');

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

// CORS — en producción solo se permite el origen explícito; en dev acepta localhost
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado para origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
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

// Los archivos se sirven desde R2 — no hay carpeta local de uploads

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

    // En producción solo crear tablas nuevas — nunca modificar schema automáticamente
    const syncOptions = process.env.NODE_ENV === 'production' ? {} : { alter: true };
    await sequelize.sync(syncOptions);

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
