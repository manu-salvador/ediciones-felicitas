const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Book = require('../models/Book');
const Config = require('../models/Config');
const { isAndreaniConfigured, calcularTarifa } = require('../services/andreaniService');

// Límite específico para cálculos de tarifa — evita abuso o scraping de precios
const shippingLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minuto
  max: 20,                    // máx 20 cálculos por minuto por IP
  message: { error: 'Demasiadas solicitudes de cálculo de envío. Esperá un momento.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Valida un código postal argentino.
 * Acepta formato numérico de 4 dígitos (sistema antiguo) o
 * alfanumérico CPA de 8 caracteres (ej: B1900XAX).
 */
const isValidCP = (cp) => {
  if (!cp || typeof cp !== 'string') return false;
  const trimmed = cp.trim();
  return /^\d{4}$/.test(trimmed) || /^[A-Z]\d{4}[A-Z]{3}$/.test(trimmed.toUpperCase());
};

/**
 * POST /api/shipping/calcular
 * Calcula el costo de envío para un carrito dado un CP destino.
 *
 * Body: {
 *   cpDestino: string,
 *   items: [{ bookId: number, qty: number, edicion: string }]
 * }
 *
 * Respuesta exitosa: {
 *   shippingCost: number,
 *   source: 'andreani' | 'fixed',
 *   diasEstimados?: string | null,
 *   servicio?: string
 * }
 *
 * Seguridad:
 * - Rate limiting por IP
 * - Validación estricta de CP y bookIds
 * - Solo items físicos se consideran para el cálculo
 * - Si Andreani falla → fallback automático a tarifa fija
 * - No expone credenciales ni datos internos en errores
 */
router.post('/calcular', shippingLimiter, async (req, res) => {
  try {
    const { cpDestino, items } = req.body;

    // ── Validaciones de entrada ────────────────────────────────────────────
    if (!cpDestino || !isValidCP(String(cpDestino))) {
      return res.status(400).json({ error: 'Código postal inválido. Ingresá 4 dígitos (ej: 1425).' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // Solo items físicos necesitan envío
    const itemsFisicos = items.filter(
      (i) => i.edicion === 'fisico' && Number.isInteger(Number(i.bookId)) && Number(i.qty) > 0
    );

    // Si todos son digitales → envío siempre gratis
    if (itemsFisicos.length === 0) {
      return res.json({ shippingCost: 0, source: 'digital', diasEstimados: null });
    }

    // ── Andreani: calcular tarifa real ─────────────────────────────────────
    if (isAndreaniConfigured()) {
      try {
        // Buscar dimensiones de cada libro en la DB
        const bultos = [];
        for (const item of itemsFisicos) {
          const book = await Book.findByPk(Number(item.bookId), {
            attributes: ['id', 'peso', 'alto', 'ancho', 'largo'],
          });
          if (!book) continue;

          // Valores por defecto del cliente (si el admin no cargó dimensiones específicas)
          const peso  = book.peso  || 300;   // gramos
          const alto  = book.alto  || 23;    // cm
          const ancho = book.ancho || 14;    // cm
          const largo = book.largo || 3;     // cm (grosor)

          // Repetir el bulto según cantidad
          for (let i = 0; i < Number(item.qty); i++) {
            bultos.push({ peso, alto, ancho, largo });
          }
        }

        if (bultos.length === 0) {
          return res.status(400).json({ error: 'No se pudieron obtener los datos de los libros' });
        }

        const resultado = await calcularTarifa(String(cpDestino).trim(), bultos);
        return res.json({
          shippingCost: resultado.costo,
          diasEstimados: resultado.diasEstimados,
          servicio: resultado.servicio,
          source: 'andreani',
        });

      } catch (andreaniErr) {
        // Si Andreani falla → fallback a tarifa fija, no romper el checkout
        console.error('[shipping] Andreani falló, usando tarifa fija:', andreaniErr.message);
      }
    }

    // ── Fallback: tarifa fija desde Config ─────────────────────────────────
    const row = await Config.findByPk('shipping_cost');
    const shippingCost = row ? Number(row.value) : 0;
    return res.json({ shippingCost, source: 'fixed', diasEstimados: null });

  } catch (err) {
    console.error('[shipping] Error inesperado:', err.message);
    res.status(500).json({ error: 'Error al calcular el envío. Intentá de nuevo.' });
  }
});

module.exports = router;
