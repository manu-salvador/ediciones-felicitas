/**
 * middleware/validate.js
 * Validación y sanitización server-side de inputs.
 * 
 * PRINCIPIO: El frontend puede ser bypasseado con Postman/curl/scripts.
 * Esta capa es la última línea de defensa real antes de la DB.
 * 
 * Usa Sequelize con queries parametrizadas → SQL Injection cubierto por el ORM.
 * Esta capa cubre: XSS, campos faltantes, tipos incorrectos, longitud excesiva.
 */

const MAX = {
  name:         60,
  email:        120,
  phone:        20,
  password:     128,
  address:      150,
  title:        200,
  author:       120,
  editorial:    120,
  description:  5000,
  isbn:         20,
  language:     50,
  cuit:         15,
  businessName: 120,
  street:       100,
  city:         60,
  province:     60,
  zip:          10,
  streetNumber: 10,
};

/**
 * Elimina etiquetas HTML y caracteres de control peligrosos.
 * No usamos dompurify en el backend (requiere JSDOM) — para campos de texto
 * plano el strip de tags es suficiente y mucho más liviano.
 */
const stripTags = (str) =>
  typeof str === 'string'
    ? str.replace(/<[^>]*>/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()
    : str;

/**
 * Valida que el valor sea un string no vacío dentro del límite.
 * Retorna el valor sanitizado o lanza un objeto de error.
 */
const validateStr = (value, fieldName, maxLen, required = true) => {
  if (value === undefined || value === null || value === '') {
    if (required) throw { status: 400, message: `El campo '${fieldName}' es obligatorio` };
    return '';
  }
  if (typeof value !== 'string') throw { status: 400, message: `El campo '${fieldName}' debe ser texto` };
  const clean = stripTags(value);
  if (clean.length > maxLen) throw { status: 400, message: `El campo '${fieldName}' excede el límite de ${maxLen} caracteres` };
  return clean;
};

const validateEmail = (value) => {
  const clean = validateStr(value, 'email', MAX.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean))
    throw { status: 400, message: 'El email no tiene un formato válido' };
  return clean.toLowerCase();
};

const validatePhone = (value, required = false) => {
  if (!value && !required) return '';
  const clean = validateStr(value, 'teléfono', MAX.phone, required);
  // Solo dígitos, +, -, espacios y paréntesis
  if (clean && !/^[\d+\-\s()]+$/.test(clean))
    throw { status: 400, message: 'El teléfono solo puede contener dígitos, +, - y espacios' };
  return clean;
};

const validateNumber = (value, fieldName) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) throw { status: 400, message: `El campo '${fieldName}' debe ser un número positivo` };
  return num;
};

// ─── Middleware factories ─────────────────────────────────────────────────────

/**
 * Validar body de registro de usuario
 */
const validateRegister = (req, res, next) => {
  try {
    req.body.email     = validateEmail(req.body.email);
    req.body.firstName = validateStr(req.body.firstName, 'nombre', MAX.name);
    req.body.lastName  = validateStr(req.body.lastName, 'apellido', MAX.name);
    req.body.phone     = validatePhone(req.body.phone, false);
    
    const { password } = req.body;
    if (!password || typeof password !== 'string')
      throw { status: 400, message: 'La contraseña es obligatoria' };
    if (password.length < 6)
      throw { status: 400, message: 'La contraseña debe tener al menos 6 caracteres' };
    if (password.length > MAX.password)
      throw { status: 400, message: `La contraseña excede el límite de ${MAX.password} caracteres` };
    
    next();
  } catch (err) {
    res.status(err.status || 400).json({ success: false, error: err.message || 'Datos inválidos' });
  }
};

/**
 * Validar body de login
 */
const validateLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      throw { status: 400, message: 'Email y contraseña son obligatorios' };
    req.body.email = validateEmail(email);
    if (typeof password !== 'string' || password.length > MAX.password)
      throw { status: 400, message: 'Contraseña inválida' };
    next();
  } catch (err) {
    res.status(err.status || 400).json({ success: false, error: err.message || 'Datos inválidos' });
  }
};

/**
 * Validar body de actualización de perfil
 */
const validateUpdateProfile = (req, res, next) => {
  try {
    if (req.body.email !== undefined)
      req.body.email = validateEmail(req.body.email);
    if (req.body.firstName !== undefined)
      req.body.firstName = validateStr(req.body.firstName, 'nombre', MAX.name);
    if (req.body.lastName !== undefined)
      req.body.lastName = validateStr(req.body.lastName, 'apellido', MAX.name);
    if (req.body.phone !== undefined)
      req.body.phone = validatePhone(req.body.phone, false);
    if (req.body.address !== undefined)
      req.body.address = validateStr(req.body.address, 'dirección', MAX.address, false);
    next();
  } catch (err) {
    res.status(err.status || 400).json({ success: false, error: err.message || 'Datos inválidos' });
  }
};

/**
 * Validar body de creación/edición de libro (admin)
 */
const validateBook = (required = true) => (req, res, next) => {
  try {
    if (required || req.body.title !== undefined)
      req.body.title = validateStr(req.body.title, 'título', MAX.title, required);
    if (required || req.body.author !== undefined)
      req.body.author = validateStr(req.body.author, 'autor', MAX.author, required);
    if (req.body.editorial !== undefined)
      req.body.editorial = validateStr(req.body.editorial, 'editorial', MAX.editorial, false);
    if (req.body.description !== undefined)
      req.body.description = validateStr(req.body.description, 'descripción', MAX.description, false);
    if (req.body.isbn !== undefined)
      req.body.isbn = validateStr(req.body.isbn, 'ISBN', MAX.isbn, false);
    if (req.body.language !== undefined)
      req.body.language = validateStr(req.body.language, 'idioma', MAX.language, false);
    if (req.body.physicalPrice !== undefined && req.body.physicalPrice !== '')
      req.body.physicalPrice = validateNumber(req.body.physicalPrice, 'precio físico');
    if (req.body.digitalPrice !== undefined && req.body.digitalPrice !== '')
      req.body.digitalPrice = validateNumber(req.body.digitalPrice, 'precio digital');
    next();
  } catch (err) {
    res.status(err.status || 400).json({ success: false, error: err.message || 'Datos inválidos' });
  }
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateBook,
  stripTags,   // exportado para uso en controllers si necesitan sanitizar manualmente
  MAX,
};
