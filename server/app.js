require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const errorHandler = require('./middlewares/errorHandler');

// Rutas
const adminAuthRoutes = require('./routes/adminAuth');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const adminOrderRoutes = require('./routes/adminOrders');
const mpRoutes = require('./routes/mercadopago');
const downloadRoutes = require('./routes/download');
const adminBookRoutes = require('./routes/adminBooks');

const app = express();

// ─── Seguridad ─────────────────────────────────────────────────────────────
// CSP configurada para permitir imágenes y fuentes externas (Google Fonts, etc.)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permite que el browser Vite cargue imágenes del backend
    contentSecurityPolicy: false,                           // Desactivado en dev; activar con config explícita en prod
  })
);

const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['https://edicionesfelicitas.com.ar', 'https://www.edicionesfelicitas.com.ar']
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman, curl, etc.) en desarrollo
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    credentials: true,
  })
);

// ─── Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Archivos estáticos (imágenes de portada, PDFs) ────────────────────────
// Sirve la carpeta uploads en la ruta /uploads
// Ej: GET /uploads/covers/Macacha-Guemes-mockup.png
const uploadsPath = path.join(__dirname, process.env.UPLOADS_PATH || 'uploads');
app.use('/uploads', require('express').static(uploadsPath));

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Rutas de la API ───────────────────────────────────────────────────────
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/admin/books', adminBookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/mp', mpRoutes);
app.use('/api/download', downloadRoutes);

// ─── 404 ───────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

// ─── Error handler global ──────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
