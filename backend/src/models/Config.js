const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Simple key-value store for app configuration.
// Stored in PostgreSQL so it survives Railway re-deploys.
const Config = sequelize.define('Config', {
  key: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: false,
});

module.exports = Config;
