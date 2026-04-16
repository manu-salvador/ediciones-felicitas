const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// PENDIENTE: reemplazar con datos reales del cliente
const CONTACTO_EMAIL = 'info@edicionesfelicitas.com.ar';
const CONTACTO_TEL   = '+54 9 XXX XXX-XXXX';

const formatPeso = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(n));

const buildOrderConfirmationHtml = (order) => {
  const itemsHtml = order.OrderItems.map((item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0ebe4;">${item.titulo}${item.autor ? ` — ${item.autor}` : ''}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0ebe4;text-align:center;color:#888;">${item.edicion === 'digital' ? 'Digital' : 'Físico'} x${item.qty}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0ebe4;text-align:right;font-weight:bold;">${formatPeso(Number(item.precio) * item.qty)}</td>
    </tr>
  `).join('');

  const costoEnvio = Number(order.costoEnvio || 0);
  const envioRow = costoEnvio > 0
    ? `<tr>
        <td colspan="2" style="padding:8px 0 0;font-size:13px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Envío</td>
        <td style="padding:8px 0 0;text-align:right;font-size:15px;color:#555;">${formatPeso(costoEnvio)}</td>
       </tr>`
    : '';

  const envioHtml = order.direccionEnvio
    ? `<p style="margin:16px 0 0;font-size:14px;color:#555;">
        <strong>Dirección de envío:</strong> ${order.direccionEnvio}<br>
        Si necesitás cambiar la dirección o avisarnos algo, contactanos a
        <a href="mailto:${CONTACTO_EMAIL}" style="color:#8B5E3C;">${CONTACTO_EMAIL}</a>
        o al <strong>${CONTACTO_TEL}</strong>.
      </p>`
    : `<p style="margin:16px 0 0;font-size:14px;color:#555;">Tu edición digital estará disponible para descargar desde tu cuenta.</p>`;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#faf8f5;font-family:Georgia,serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:40px 20px;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

            <!-- Header -->
            <tr><td style="background:#2c1a0e;padding:32px 40px;text-align:center;">
              <p style="margin:0;color:#d4a96a;font-size:11px;letter-spacing:4px;text-transform:uppercase;font-family:Arial,sans-serif;">Ediciones Felicitas</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:normal;">¡Gracias por tu compra!</h1>
            </td></tr>

            <!-- Body -->
            <tr><td style="padding:40px;">
              <p style="margin:0 0 24px;font-size:16px;color:#2c1a0e;">Hola <strong>${order.nombreComprador}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                Tu pedido fue aprobado. A continuación el detalle:
              </p>

              <!-- Items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <thead>
                  <tr style="border-bottom:2px solid #2c1a0e;">
                    <th style="padding:8px 0;text-align:left;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;font-family:Arial,sans-serif;font-weight:normal;">Libro</th>
                    <th style="padding:8px 0;text-align:center;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;font-family:Arial,sans-serif;font-weight:normal;">Tipo</th>
                    <th style="padding:8px 0;text-align:right;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;font-family:Arial,sans-serif;font-weight:normal;">Precio</th>
                  </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
                <tfoot>
                  ${envioRow}
                  <tr>
                    <td colspan="2" style="padding:12px 0 0;font-size:13px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Total</td>
                    <td style="padding:12px 0 0;text-align:right;font-size:20px;font-weight:bold;color:#2c1a0e;">${formatPeso(order.total)}</td>
                  </tr>
                </tfoot>
              </table>

              ${envioHtml}

              <hr style="border:none;border-top:1px solid #f0ebe4;margin:32px 0;">
              <p style="margin:0;font-size:14px;color:#888;line-height:1.6;font-family:Arial,sans-serif;">
                Muchas gracias por elegirnos.<br>
                — El equipo de Ediciones Felicitas
              </p>
            </td></tr>

            <!-- Footer -->
            <tr><td style="background:#f7f3ee;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#aaa;font-family:Arial,sans-serif;">
                ${CONTACTO_EMAIL} · ${CONTACTO_TEL}<br>
                <a href="https://www.edicionesfelicitas.com.ar" style="color:#8B5E3C;">edicionesfelicitas.com.ar</a>
              </p>
            </td></tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
};

const sendOrderConfirmation = async (order) => {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY no configurado — email omitido');
    return;
  }
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM || 'noreply@edicionesfelicitas.com.ar',
      to: order.emailComprador,
      subject: '¡Tu pedido fue aprobado! — Ediciones Felicitas',
      html: buildOrderConfirmationHtml(order),
    });
    console.log(`[email] Confirmación enviada a ${order.emailComprador}`);
  } catch (err) {
    // No fallar el flujo principal si el email falla
    console.error('[email] Error al enviar confirmación:', err.message);
  }
};

module.exports = { sendOrderConfirmation };
