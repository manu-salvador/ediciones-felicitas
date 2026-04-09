const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Sube un archivo a R2.
 * @param {Buffer} buffer  - contenido del archivo
 * @param {string} key     - ruta dentro del bucket, ej: "libros/abc123.jpg"
 * @param {string} mimeType
 */
const uploadToR2 = async (buffer, key, mimeType) => {
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }));
};

/**
 * Genera una URL firmada para descargar un objeto privado.
 * @param {string} key         - clave del objeto en R2
 * @param {number} expiresIn   - segundos de validez (default: 600 = 10 min)
 */
const getSignedDownloadUrl = async (key, expiresIn = 600) => {
  return getSignedUrl(
    r2,
    new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }),
    { expiresIn }
  );
};

/**
 * Elimina un objeto de R2.
 * @param {string} key
 */
const deleteFromR2 = async (key) => {
  await r2.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  }));
};

/**
 * Devuelve la URL pública de una portada.
 * Las portadas usan el dominio público de R2 (configurado en el bucket).
 * @param {string} key  - ej: "libros/abc123.jpg"
 */
const getPublicUrl = (key) => `${process.env.R2_PUBLIC_URL}/${key}`;

module.exports = { uploadToR2, getSignedDownloadUrl, deleteFromR2, getPublicUrl };
