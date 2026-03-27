require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './ediciones_felicitas.sqlite', // Guardará un archivo local
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

module.exports = sequelize;
