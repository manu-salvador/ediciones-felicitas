import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useUser } from '../context/UserContext';
import api from '../services/api';

const inputClass = 'w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';
const labelClass = 'block text-[0.625rem] font-bold uppercase tracking-widest text-outline mb-2';

const formatPeso = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

const CONTACT_PHONE = '+54 9 11 0000-0000'; // reemplazar con el teléfono real del cliente
const CONTACT_EMAIL = 'contacto@edicionesfelicitas.com.ar'; // reemplazar con el email real

const CANCEL_REASON_LABELS = { me_equivoque: 'Me equivoqué', me_arrepenti: 'Me arrepentí' };
const ADMIN_CANCEL_REASONS = [
  { value: 'falta_stock', label: 'Falta de stock' },
  { value: 'pago_rechazado', label: 'Pago rechazado' },
  { value: 'problema_envio', label: 'Problema con el envío' },
  { value: 'otro', label: 'Otro motivo' },
];

function OrderStatusBadge({ status }) {
  const map = {
    approved:                { label: 'Aprobado',             cls: 'bg-green-100 text-green-700' },
    pending:                 { label: 'Pendiente',            cls: 'bg-amber-100 text-amber-700' },
    in_process:              { label: 'En proceso',           cls: 'bg-blue-100 text-blue-700' },
    shipped:                 { label: 'En camino',            cls: 'bg-blue-100 text-blue-700' },
    delivered:               { label: 'Entregado',            cls: 'bg-green-100 text-green-700' },
    rejected:                { label: 'Rechazado',            cls: 'bg-error/10 text-error' },
    cancelled:               { label: 'Cancelado',            cls: 'bg-surface-high text-on-surface-variant' },
    cancellation_requested:  { label: 'Cancelación solicitada', cls: 'bg-orange-100 text-orange-700' },
  };
  const { label, cls } = map[status] || { label: status, cls: 'bg-surface-high text-on-surface-variant' };
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;
const canRequestCancel = (order) =>
  ['pending', 'approved', 'in_process'].includes(order.status) &&
  Date.now() - new Date(order.createdAt).getTime() < CANCEL_WINDOW_MS;

function OrdersSection({ userToken }) {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('me_equivoque');
  const [cancelLoading, setCancelLoading] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${userToken}` } };

  useEffect(() => {
    setOrdersLoading(true);
    setOrdersError('');
    api.get('/orders/my', authHeaders)
      .then(({ data }) => setOrders(data))
      .catch(() => setOrdersError('No se pudieron cargar tus pedidos. Intentá de nuevo.'))
      .finally(() => setOrdersLoading(false));
  }, [userToken]);

  const handleRequestCancel = async (orderId) => {
    setCancelLoading(true);
    try {
      const { data } = await api.post(`/orders/${orderId}/request-cancel`, { reason: cancelReason }, authHeaders);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data } : o));
      setCancelingId(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al solicitar la cancelación');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleConfirmDelivery = async (orderId) => {
    try {
      const { data } = await api.post(`/orders/${orderId}/confirm-delivery`, {}, authHeaders);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data } : o));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al confirmar la entrega');
    }
  };

  const [downloadingItem, setDownloadingItem] = useState(null);

  const handleDownload = async (orderId, itemId, titulo) => {
    setDownloadingItem(itemId);
    try {
      const response = await api.get(`/orders/${orderId}/download/${itemId}`, {
        ...authHeaders,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${titulo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Error al descargar el archivo. Intentá de nuevo.');
    } finally {
      setDownloadingItem(null);
    }
  };

  if (ordersLoading) {
    return (
      <div className="flex justify-center py-16">
        <svg className="w-8 h-8 animate-spin text-primary/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    );
  }

  if (ordersError) {
    return <p className="text-error text-sm py-8 text-center">{ordersError}</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-outline-variant mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <p className="text-on-surface-variant font-medium mb-1">Todavía no realizaste ningún pedido</p>
        <p className="text-on-surface-variant/60 text-sm mb-6">Cuando completes una compra, aparecerá aquí con su estado.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all"
        >
          Explorar el catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border-2 border-outline-variant/40 rounded-xl overflow-hidden shadow-sm">
          {/* Order header row */}
          <button
            onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
            className="w-full flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-surface hover:bg-surface-low transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-on-surface-variant">#{String(order.id).padStart(5, '0')}</span>
              <span className="text-xs text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString('es-AR')}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-headline font-bold text-primary">{formatPeso(order.total)}</span>
              <OrderStatusBadge status={order.status} />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 text-on-surface-variant transition-transform ${expandedId === order.id ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </button>

          {/* Expanded details */}
          {expandedId === order.id && (
            <div className="border-t border-outline-variant/20 px-6 py-4 bg-surface-low space-y-4">
              {/* Delivery info */}
              <div className="text-xs text-on-surface-variant">
                <span className="uppercase tracking-widest font-bold text-outline">Entrega:</span>{' '}
                <span className="capitalize">{order.tipoEntrega}</span>
                {order.direccionEnvio && <> — {order.direccionEnvio}</>}
              </div>

              {/* Items table */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-outline uppercase tracking-widest text-[10px]">
                    <th className="pb-1.5">Título</th>
                    <th className="pb-1.5">Edición</th>
                    <th className="pb-1.5 text-right">Precio</th>
                    <th className="pb-1.5 text-right">Cant.</th>
                    <th className="pb-1.5 text-right">Archivo</th>
                  </tr>
                </thead>
                <tbody>
                  {order.OrderItems?.map((item, idx) => (
                    <tr key={idx} className="border-t border-outline-variant/10">
                      <td className="py-1.5 text-on-surface font-medium">{item.titulo}</td>
                      <td className="py-1.5 capitalize text-on-surface-variant">{item.edicion}</td>
                      <td className="py-1.5 text-right text-on-surface">{formatPeso(item.precio)}</td>
                      <td className="py-1.5 text-right text-on-surface">{item.qty}</td>
                      <td className="py-1.5 text-right">
                        {item.edicion === 'digital' && item.archivoDigital && ['approved','delivered'].includes(order.status) && (
                          <button
                            onClick={() => handleDownload(order.id, item.id, item.titulo)}
                            disabled={downloadingItem === item.id}
                            className="inline-flex items-center gap-1 text-primary font-bold hover:underline disabled:opacity-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            {downloadingItem === item.id ? 'Descargando…' : 'Descargar'}
                          </button>
                        )}
                        {item.edicion === 'digital' && item.archivoDigital && !['approved','delivered'].includes(order.status) && (
                          <span className="text-on-surface-variant/50 text-[10px]">Disponible al confirmar pago</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Status-specific actions */}

              {/* Cancelación solicitada */}
              {order.status === 'cancellation_requested' && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700">
                  Tu solicitud de cancelación fue enviada. Motivo: <strong>{CANCEL_REASON_LABELS[order.cancelReason] || order.cancelReason}</strong>. Esperando respuesta de la editorial.
                </div>
              )}

              {/* Nota del admin (cancelado o rechazado) */}
              {order.cancelNote && ['cancelled', 'approved'].includes(order.status) && (
                <div className="p-3 bg-surface border border-outline-variant/30 rounded-lg text-xs text-on-surface-variant">
                  <span className="font-bold text-outline uppercase tracking-widest">Nota de la editorial: </span>
                  {order.cancelNote}
                </div>
              )}

              {/* En camino */}
              {order.status === 'shipped' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  Tu pedido está en camino. Te avisamos cuando esté entregado.
                </div>
              )}

              {/* Confirmar recepción */}
              {order.status === 'delivered' && !order.clientConfirmedDelivery && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs">
                  <p className="text-green-700 mb-2">La editorial marcó tu pedido como entregado. ¿Ya lo recibiste?</p>
                  <button
                    onClick={() => handleConfirmDelivery(order.id)}
                    className="px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-full hover:bg-green-700 transition-colors"
                  >
                    Sí, ya lo recibí
                  </button>
                </div>
              )}
              {order.status === 'delivered' && order.clientConfirmedDelivery && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Entrega confirmada. ¡Gracias por tu compra!
                </div>
              )}

              {/* Solicitar cancelación */}
              {canRequestCancel(order) && cancelingId !== order.id && (
                <button
                  onClick={(e) => { e.stopPropagation(); setCancelingId(order.id); setCancelReason('me_equivoque'); }}
                  className="text-xs text-error/70 hover:text-error underline underline-offset-2 transition-colors"
                >
                  Solicitar cancelación
                </button>
              )}
              {cancelingId === order.id && (
                <div className="p-3 bg-error/5 border border-error/20 rounded-lg space-y-3 text-xs">
                  <p className="font-semibold text-error">Solicitar cancelación — tenés hasta 24 hs desde la compra</p>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm bg-surface"
                  >
                    <option value="me_equivoque">Me equivoqué</option>
                    <option value="me_arrepenti">Me arrepentí</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRequestCancel(order.id)}
                      disabled={cancelLoading}
                      className="px-4 py-1.5 bg-error text-white font-bold rounded-full hover:bg-error/90 transition-colors disabled:opacity-50"
                    >
                      {cancelLoading ? 'Enviando...' : 'Confirmar solicitud'}
                    </button>
                    <button
                      onClick={() => setCancelingId(null)}
                      className="px-4 py-1.5 bg-surface border border-outline-variant text-on-surface-variant font-bold rounded-full hover:bg-surface-high transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Contacto / reclamo */}
              <div className="pt-2 border-t border-outline-variant/20 text-xs text-on-surface-variant">
                Ante cualquier duda o inconveniente comunicarse a{' '}
                <a href={`tel:${CONTACT_PHONE}`} className="text-primary hover:underline">{CONTACT_PHONE}</a>
                {' '}o{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ProfileSection({ user, onSave }) {
  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
  });
  const handleNombreChange = (e) => {
    const val = e.target.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]/g, '');
    setForm(f => ({ ...f, nombre: val.slice(0, 80) }));
  };
  const handleTelefonoChange = (e) => {
    const val = e.target.value.replace(/[^0-9+\s\-()]/g, '');
    setForm(f => ({ ...f, telefono: val.slice(0, 25) }));
  };
  const handleEmailChange = (e) => {
    setForm(f => ({ ...f, email: e.target.value.slice(0, 100) }));
  };
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await onSave(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Nombre</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleNombreChange}
            className={inputClass}
            maxLength={80}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <input
            name="telefono"
            value={form.telefono}
            onChange={handleTelefonoChange}
            className={inputClass}
            maxLength={25}
            placeholder="+54 11 ..."
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleEmailChange}
          className={inputClass}
          maxLength={100}
          required
        />
      </div>

      {error && <p className="text-error text-sm">{error}</p>}
      {success && <p className="text-sm text-tertiary font-medium">Cambios guardados correctamente.</p>}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}

function AddressSection({ user, onSave }) {
  const parseAddress = (str, ciudadFallback) => {
    if (!str) return { calle: '', altura: '', piso: '', ciudad: ciudadFallback || '' };
    // formato: "Calle NUMERO [piso] - Ciudad"
    const [calleBloque, ciudadBloque] = str.split(' - ');
    const parts = (calleBloque || '').trim().split(' ');
    const altura = parts.length > 1 && /^\d/.test(parts[1]) ? parts[1] : '';
    const calle = parts[0] || '';
    const piso = parts.slice(2).join(' ');
    return { calle, altura, piso, ciudad: ciudadBloque?.trim() || ciudadFallback || '' };
  };

  const [form, setForm] = useState(() => parseAddress(user?.direccion, user?.ciudad));
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const buildDireccion = () => {
    const pisoParte = form.piso.trim() ? ` ${form.piso.trim()}` : '';
    return `${form.calle.trim()} ${form.altura.trim()}${pisoParte} - ${form.ciudad.trim()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.calle.trim() || !form.altura.trim() || !form.ciudad.trim()) {
      return setError('Calle, altura y ciudad son obligatorias');
    }
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await onSave({ direccion: buildDireccion(), ciudad: form.ciudad.trim() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la dirección');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Calle *</label>
          <input
            value={form.calle}
            onChange={(e) => setForm(f => ({ ...f, calle: e.target.value.replace(/[<>]/g, '').slice(0, 100) }))}
            className={inputClass}
            placeholder="Av. Corrientes"
            maxLength={100}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Número *</label>
          <input
            value={form.altura}
            onChange={(e) => setForm(f => ({ ...f, altura: e.target.value.replace(/[^0-9]/g, '').slice(0, 6) }))}
            className={inputClass}
            placeholder="1234"
            required
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Piso / Dto (opcional)</label>
        <input
          value={form.piso}
          onChange={(e) => setForm(f => ({ ...f, piso: e.target.value.replace(/[<>]/g, '').slice(0, 40) }))}
          className={inputClass}
          placeholder="3° B"
          maxLength={40}
        />
      </div>
      <div>
        <label className={labelClass}>Ciudad *</label>
        <input
          value={form.ciudad}
          onChange={(e) => setForm(f => ({ ...f, ciudad: e.target.value.replace(/[<>]/g, '').slice(0, 80) }))}
          className={inputClass}
          placeholder="Buenos Aires"
          maxLength={80}
          required
        />
        <p className="text-xs text-on-surface-variant mt-2">
          Esta dirección se usará como predeterminada al finalizar una compra.
        </p>
      </div>

      {error && <p className="text-error text-sm">{error}</p>}
      {success && <p className="text-sm text-green-600 font-medium">Dirección guardada correctamente.</p>}

      {form.calle && form.altura && form.ciudad && (
        <p className="text-xs text-on-surface-variant bg-surface-high rounded-lg px-3 py-2">
          Vista previa: <span className="font-medium text-on-surface">{buildDireccion()}</span>
        </p>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar dirección'}
        </button>
      </div>
    </form>
  );
}

function SecuritySection({ onChangePassword, onDeleteAccount }) {
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  const [deletePass, setDeletePass] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [delError, setDelError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) return setPwError('Las contraseñas nuevas no coinciden');
    if (pwForm.next.length < 6) return setPwError('La nueva contraseña debe tener al menos 6 caracteres');
    setPwSaving(true); setPwError(''); setPwSuccess(false);
    try {
      await onChangePassword(pwForm.current, pwForm.next);
      setPwSuccess(true);
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err.response?.data?.error || 'Error al cambiar la contraseña');
    } finally { setPwSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true); setDelError('');
    try {
      await onDeleteAccount(deletePass);
    } catch (err) {
      setDelError(err.response?.data?.error || 'Contraseña incorrecta');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Cambiar contraseña */}
      <form onSubmit={handleChangePassword} className="space-y-5">
        <h3 className="text-base font-bold text-on-surface">Cambiar contraseña</h3>
        <div>
          <label className={labelClass}>Contraseña actual</label>
          <input type="password" value={pwForm.current} onChange={(e) => setPwForm(f => ({ ...f, current: e.target.value }))} className={inputClass} maxLength={100} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Nueva contraseña</label>
            <input type="password" value={pwForm.next} onChange={(e) => setPwForm(f => ({ ...f, next: e.target.value }))} className={inputClass} maxLength={100} minLength={6} required />
          </div>
          <div>
            <label className={labelClass}>Confirmar nueva</label>
            <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm(f => ({ ...f, confirm: e.target.value }))} className={inputClass} maxLength={100} required />
          </div>
        </div>
        {pwError && <p className="text-error text-sm">{pwError}</p>}
        {pwSuccess && <p className="text-sm text-tertiary font-medium">Contraseña actualizada correctamente.</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={pwSaving} className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50">
            {pwSaving ? 'Guardando…' : 'Cambiar contraseña'}
          </button>
        </div>
      </form>

      <div className="border-t border-error/20 pt-8">
        <h3 className="text-base font-bold text-error mb-2">Zona de peligro</h3>
        <p className="text-sm text-on-surface-variant mb-5">Una vez eliminada tu cuenta no podrás recuperarla. Se borrarán todos tus datos.</p>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-3 border-2 border-error text-error rounded-full text-xs font-bold uppercase tracking-widest hover:bg-error hover:text-white transition-colors">
            Eliminar mi cuenta
          </button>
        ) : (
          <div className="space-y-4 bg-error/5 border border-error/20 rounded-xl p-6">
            <p className="text-sm font-medium text-on-surface">Ingresá tu contraseña para confirmar:</p>
            <input type="password" value={deletePass} onChange={(e) => setDeletePass(e.target.value)} className={inputClass} placeholder="Tu contraseña" maxLength={100} />
            {delError && <p className="text-error text-sm">{delError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting || !deletePass} className="px-6 py-3 bg-error text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-error/80 transition-colors disabled:opacity-50">
                {deleting ? 'Eliminando…' : 'Confirmar eliminación'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const TABS = ['Mis pedidos', 'Mi perfil', 'Dirección', 'Seguridad'];

export default function AccountPage() {
  const { user, token, logout, updateProfile, changePassword, deleteAccount } = useUser();
  const [tab, setTab] = useState('Mis pedidos');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-8 py-16 pt-36">
        <header className="mb-10">
          <p className="text-tertiary font-bold tracking-widest uppercase text-xs mb-1">Mi cuenta</p>
          <h1 className="text-4xl font-headline text-on-surface tracking-tight">
            Hola, {user?.nombre}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">{user?.email}</p>
          {user?.ciudad && (
            <p className="text-on-surface-variant/70 text-xs mt-0.5">{user.ciudad}</p>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <nav className="space-y-1">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-left font-medium
                    ${tab === t ? 'bg-primary-container text-primary' : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}`}
                >
                  {t === 'Mis pedidos' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  )}
                  {t === 'Mi perfil' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  )}
                  {t === 'Dirección' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  )}
                  {t === 'Seguridad' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  )}
                  {t}
                </button>
              ))}
              <div className="pt-2">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  Catálogo
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-low hover:text-error transition-colors text-sm text-left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Cerrar sesión
                </button>
              </div>
            </nav>
          </aside>

          {/* Content */}
          <section className="lg:col-span-9">
            <div className="bg-surface-low rounded-xl p-8">
              {tab === 'Mis pedidos' && (
                <>
                  <h2 className="text-xl font-headline text-on-surface mb-6">Historial de pedidos</h2>
                  <OrdersSection userToken={token} />
                </>
              )}

              {tab === 'Mi perfil' && (
                <>
                  <h2 className="text-xl font-headline text-on-surface mb-6">Datos personales</h2>
                  <ProfileSection user={user} onSave={updateProfile} />
                </>
              )}

              {tab === 'Seguridad' && (
                <>
                  <h2 className="text-xl font-headline text-on-surface mb-6">Seguridad</h2>
                  <SecuritySection
                    onChangePassword={changePassword}
                    onDeleteAccount={async (password) => {
                      await deleteAccount(password);
                      navigate('/');
                    }}
                  />
                </>
              )}

              {tab === 'Dirección' && (
                <>
                  <h2 className="text-xl font-headline text-on-surface mb-2">Dirección de envío</h2>
                  {!user?.direccion && (
                    <div className="flex items-start gap-3 bg-primary-container/40 text-primary rounded-lg p-4 mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <p className="text-sm">No tenés ninguna dirección guardada. Te la pediremos antes de confirmar tu próxima compra.</p>
                    </div>
                  )}
                  <AddressSection user={user} onSave={updateProfile} />
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-outline-variant/30 py-12 mt-8">
        <div className="max-w-screen-xl mx-auto px-8 text-center text-on-surface-variant text-sm">
          <img src="/logo-ef.png" alt="Ediciones Felicitas" className="h-20 mx-auto mb-4 opacity-80" />
          <p>&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
