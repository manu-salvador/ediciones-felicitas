const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

let sequelize;

if (env === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        // rejectUnauthorized: false solo si el proveedor usa cert autofirmado (ej: Railway/Render sin CA bundle)
        // Por defecto en producción rechazamos certificados no válidos (más seguro)
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      }
    },
    logging: false
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false
  });
}

module.exports = sequelize;
