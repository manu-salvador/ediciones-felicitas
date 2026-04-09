const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs').promises;
const path = require('path');

// Check if R2 is configured
const R2_CONFIGURED = process.env.R2_ACCOUNT_ID &&
                      process.env.R2_ACCESS_KEY_ID &&
                      process.env.R2_SECRET_ACCESS_KEY &&
                      process.env.R2_BUCKET_NAME &&
                      process.env.R2_PUBLIC_URL;

let r2 = null;
if (R2_CONFIGURED) {
  r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

// Local storage directories for development
const LOCAL_UPLOADS_DIR = path.join(__dirname, '../../uploads');

/**
 * Sube un archivo a R2 o almacenamiento local.
 * @param {Buffer} buffer  - contenido del archivo
 * @param {string} key     - ruta dentro del bucket, ej: "libros/abc123.jpg"
 * @param {string} mimeType
 */
const uploadToR2 = async (buffer, key, mimeType) => {
  if (R2_CONFIGURED) {
    await r2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }));
  } else {
    // Local storage fallback for development
    const filePath = path.join(LOCAL_UPLOADS_DIR, key);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, buffer);
  }
};

/**
 * Genera una URL firmada para descargar un objeto privado.
 * @param {string} key         - clave del objeto en R2
 * @param {number} expiresIn   - segundos de validez (default: 600 = 10 min)
 */
const getSignedDownloadUrl = async (key, expiresIn = 600) => {
  if (R2_CONFIGURED) {
    return getSignedUrl(
      r2,
      new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }),
      { expiresIn }
    );
  } else {
    // Local storage: return direct URL (backend serves static files)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return `${backendUrl}/uploads/${key}`;
  }
};

/**
 * Elimina un objeto de R2 o del almacenamiento local.
 * @param {string} key
 */
const deleteFromR2 = async (key) => {
  if (R2_CONFIGURED) {
    await r2.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }));
  } else {
    // Local storage: delete file
    const filePath = path.join(LOCAL_UPLOADS_DIR, key);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      // Ignore if file doesn't exist
      if (err.code !== 'ENOENT') throw err;
    }
  }
};

/**
 * Devuelve la URL pública de una portada.
 * Las portadas usan el dominio público de R2 (configurado en el bucket).
 * @param {string} key  - ej: "libros/abc123.jpg"
 */
const getPublicUrl = (key) => {
  if (R2_CONFIGURED) {
    return `${process.env.R2_PUBLIC_URL}/${key}`;
  } else {
    // Local storage: serve from backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return `${backendUrl}/uploads/${key}`;
  }
};

module.exports = { uploadToR2, getSignedDownloadUrl, deleteFromR2, getPublicUrl };
