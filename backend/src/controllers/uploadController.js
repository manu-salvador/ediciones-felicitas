const multer = require('multer');
const path = require('path');
const { uploadToR2, getPublicUrl } = require('../config/storage');

const ALLOWED_TYPES = {
  libros: /\.(jpg|jpeg|png|webp|gif)$/i,
  digital: /\.(pdf|epub)$/i,
};
const MAX_SIZE = { libros: 15 * 1024 * 1024, digital: 50 * 1024 * 1024 };

// Multer en memoria — el archivo no toca el disco, va directo a R2
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE.digital }, // cota absoluta; el fileFilter refina por tipo
  fileFilter: (req, file, cb) => {
    const type = req.params.type === 'digital' ? 'digital' : 'libros';
    if (ALLOWED_TYPES[type].test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  },
});

const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo' });

  const type = req.params.type === 'digital' ? 'digital' : 'libros';

  // Verificar límite correcto según tipo
  if (req.file.size > MAX_SIZE[type]) {
    const maxMB = MAX_SIZE[type] / (1024 * 1024);
    return res.status(400).json({ error: `El archivo supera el límite de ${maxMB}MB` });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const key = `${type}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;

  try {
    await uploadToR2(req.file.buffer, key, req.file.mimetype);

    if (type === 'libros') {
      // Portadas → URL pública directa (se usa como <img src="...">)
      res.json({ url: getPublicUrl(key) });
    } else {
      // Digitales → solo guardamos la key; la URL se genera bajo demanda al descargar
      res.json({ url: key });
    }
  } catch (err) {
    console.error('uploadFile R2 error:', err);
    res.status(500).json({ error: 'Error al subir el archivo' });
  }
};

module.exports = { upload, uploadFile };
