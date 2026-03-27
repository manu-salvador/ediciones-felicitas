const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_PATH = process.env.UPLOADS_PATH || './uploads';

// Tipos permitidos por destino
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_PDF_TYPES = ['application/pdf'];

// Storage para portadas de libros
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(UPLOADS_PATH, 'covers'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

// Storage para PDFs de libros digitales
const digitalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(UPLOADS_PATH, 'digital'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

// Filtros de tipo de archivo
const imageFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('Solo se permiten imágenes JPEG, PNG o WebP');
    err.code = 'LIMIT_FILE_TYPE';
    cb(err, false);
  }
};

const pdfFilter = (req, file, cb) => {
  if (ALLOWED_PDF_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('Solo se permiten archivos PDF');
    err.code = 'LIMIT_FILE_TYPE';
    cb(err, false);
  }
};

// Instancias de Multer
const uploadCover = multer({
  storage: coverStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const uploadDigital = multer({
  storage: digitalStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

// Upload combinado para crear/editar libros (cover + digitalFile en un solo request)
const uploadBookFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'coverImage') {
        cb(null, path.join(UPLOADS_PATH, 'covers'));
      } else if (file.fieldname === 'digitalFile') {
        cb(null, path.join(UPLOADS_PATH, 'digital'));
      } else {
        cb(new Error('Campo de archivo no reconocido'), false);
      }
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'coverImage') {
      imageFilter(req, file, cb);
    } else if (file.fieldname === 'digitalFile') {
      pdfFilter(req, file, cb);
    } else {
      cb(new Error('Campo de archivo no reconocido'), false);
    }
  },
  limits: { fileSize: 100 * 1024 * 1024 },
});

module.exports = { uploadCover, uploadDigital, uploadBookFiles };
