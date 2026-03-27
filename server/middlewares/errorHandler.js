/**
 * Error handler global de Express.
 * Normaliza errores de Sequelize, Multer y genéricos.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[ErrorHandler]', err);

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({ success: false, error: 'Error de validación', details: messages });
  }

  // Error de clave única de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'campo';
    return res.status(409).json({ success: false, error: `Ya existe un registro con ese ${field}` });
  }

  // Error de clave foránea de Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ success: false, error: 'Referencia a un registro que no existe' });
  }

  // Error de Multer — tipo de archivo no permitido
  if (err.code === 'LIMIT_FILE_TYPE') {
    return res.status(400).json({ success: false, error: err.message });
  }

  // Error de Multer — tamaño excedido
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, error: 'El archivo excede el tamaño máximo permitido' });
  }

  // Error genérico
  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message || 'Error interno del servidor';

  res.status(status).json({ success: false, error: message });
};

module.exports = errorHandler;
