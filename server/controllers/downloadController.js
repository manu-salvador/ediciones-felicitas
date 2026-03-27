const path = require('path');
const fs = require('fs');
const { OrderItem, Book } = require('../models');

/**
 * GET /api/download/:token
 * Endpoint de descarga de libro digital.
 * Valida: token existe, no expiró, no superó el límite de descargas.
 * Sirve el archivo directamente al cliente.
 */
const downloadDigital = async (req, res, next) => {
  try {
    const { token } = req.params;

    const item = await OrderItem.findOne({
      where: { downloadToken: token },
      include: [{ model: Book, as: 'book', attributes: ['title', 'digitalFile'] }],
    });

    if (!item) {
      return res.status(404).json({ success: false, error: 'Link de descarga inválido' });
    }

    // Verificar expiración
    if (item.downloadTokenExpiry && new Date() > item.downloadTokenExpiry) {
      return res.status(410).json({ success: false, error: 'El link de descarga ha expirado' });
    }

    // Verificar límite de descargas
    if (item.downloadCount >= item.maxDownloads) {
      return res.status(410).json({
        success: false,
        error: `Se superó el límite de ${item.maxDownloads} descargas para este libro`,
      });
    }

    // Verificar que el archivo existe en el Volume
    const uploadsPath = process.env.UPLOADS_PATH || './uploads';
    const filePath = path.join(uploadsPath, item.book.digitalFile);

    if (!fs.existsSync(filePath)) {
      console.error(`[Download] Archivo no encontrado: ${filePath}`);
      return res.status(500).json({ success: false, error: 'Archivo no disponible. Contactar soporte.' });
    }

    // Incrementar el contador de descargas
    await item.increment('downloadCount');

    // Servir el archivo como descarga
    const safeTitle = item.book.title.replace(/[^a-zA-Z0-9À-ÿ\s]/g, '').trim().replace(/\s+/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = { downloadDigital };
