/**
 * andreaniService.js
 * Integración con la API de Andreani para cálculo de tarifas de envío.
 *
 * Variables de entorno requeridas (cargar en Railway cuando el cliente tenga cuenta):
 *   ANDREANI_USER       — usuario de la API
 *   ANDREANI_PASS       — contraseña de la API
 *   ANDREANI_CONTRATO   — número de contrato (ej: "300006")
 *   ANDREANI_CP_ORIGEN  — CP desde donde se despacha (ej: "1425")
 *
 * Documentación oficial: https://developers.andreani.com
 */

const https = require('https');

const BASE_URL = 'https://apis.andreani.com';

// ---------------------------------------------------------------------------
// Token cache — Andreani emite tokens JWT con TTL ~1h.
// Cachearlos evita un round-trip extra en cada cálculo.
// ---------------------------------------------------------------------------
let _cachedToken = null;
let _tokenExpiresAt = 0;
const TOKEN_BUFFER_MS = 5 * 60 * 1000; // renovar 5 min antes de expirar

const isAndreaniConfigured = () =>
  !!(process.env.ANDREANI_USER && process.env.ANDREANI_PASS &&
     process.env.ANDREANI_CONTRATO && process.env.ANDREANI_CP_ORIGEN);

/**
 * Obtiene (o reutiliza) el token JWT de Andreani.
 * @returns {Promise<string>} token
 */
const getToken = async () => {
  if (_cachedToken && Date.now() < _tokenExpiresAt - TOKEN_BUFFER_MS) {
    return _cachedToken;
  }

  const credentials = Buffer.from(
    `${process.env.ANDREANI_USER}:${process.env.ANDREANI_PASS}`
  ).toString('base64');

  const loginBody = JSON.stringify({
    userName: process.env.ANDREANI_USER,
    password: process.env.ANDREANI_PASS,
  });

  const token = await new Promise((resolve, reject) => {
    const req = https.request(
      `${BASE_URL}/login`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginBody),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          // Token puede venir en header o en body
          const t = res.headers['x-authorization-token'] ||
            (() => { try { const j = JSON.parse(raw); return j.token || j.access_token; } catch { return null; } })();
          if (!t) return reject(new Error(`Andreani login fallido (${res.statusCode}): ${raw}`));
          resolve(t);
        });
      }
    );
    req.on('error', reject);
    req.write(loginBody);
    req.end();
  });

  _cachedToken = token;
  // Andreani tokens duran ~1h; parseamos el payload si está disponible
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    _tokenExpiresAt = (payload.exp || (Date.now() / 1000 + 3600)) * 1000;
  } catch {
    _tokenExpiresAt = Date.now() + 60 * 60 * 1000; // fallback: 1h
  }

  console.log('[andreani] Token renovado, expira:', new Date(_tokenExpiresAt).toISOString());
  return token;
};

/**
 * Calcula la tarifa de envío para un conjunto de bultos.
 *
 * @param {string} cpDestino  — CP del comprador (4 dígitos)
 * @param {Array}  bultos     — [{ kilos, alto, ancho, largo }]
 * @returns {Promise<{ costo: number, diasEstimados: string|null, servicio: string }>}
 */
const calcularTarifa = async (cpDestino, bultos) => {
  if (!isAndreaniConfigured()) {
    throw new Error('Andreani no configurado — usar tarifa fija como fallback');
  }

  const token = await getToken();

  const body = JSON.stringify({
    contrato: process.env.ANDREANI_CONTRATO,
    cpOrigen: process.env.ANDREANI_CP_ORIGEN,
    cpDestino: String(cpDestino).trim(),
    bultos: bultos.map((b) => ({
      kilos: parseFloat((b.peso / 1000).toFixed(3)), // gramos → kg
      alto: parseFloat(b.alto) || 5,
      ancho: parseFloat(b.ancho) || 15,
      largo: parseFloat(b.largo) || 20,
    })),
  });

  const data = await new Promise((resolve, reject) => {
    const req = https.request(
      `${BASE_URL}/v1/tarifas`,
      {
        method: 'POST',
        headers: {
          'x-authorization-token': token,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(raw);
            if (res.statusCode >= 400) {
              return reject(new Error(`Andreani error ${res.statusCode}: ${raw}`));
            }
            resolve(json);
          } catch {
            reject(new Error(`Andreani: respuesta no JSON — ${raw}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });

  // La API devuelve un array de opciones de servicio
  // Tomamos la primera (generalmente la más económica del contrato)
  const opciones = Array.isArray(data) ? data : [data];
  if (!opciones.length) throw new Error('Andreani: sin opciones de tarifa disponibles');

  const opcion = opciones[0];

  return {
    costo: Math.ceil(Number(opcion.importeTotal || opcion.total || opcion.precio || 0)),
    diasEstimados: opcion.plazoEntrega || opcion.diasHabiles || null,
    servicio: opcion.descripcion || opcion.nombre || 'Andreani',
  };
};

module.exports = { isAndreaniConfigured, calcularTarifa };
