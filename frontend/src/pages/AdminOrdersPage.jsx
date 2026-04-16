import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import Spinner from '../components/ui/Spinner';
import api from '../services/api';

const formatPeso = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

const CANCEL_REASON_LABELS = { me_equivoque: 'Me equivoqué', me_arrepenti: 'Me arrepentí' };
const ADMIN_CANCEL_REASONS = [
  { value: 'falta_stock',    label: 'Falta de stock' },
  { value: 'pago_rechazado', label: 'Pago rechazado' },
  { value: 'problema_envio', label: 'Problema con el envío' },
  { value: 'otro',           label: 'Otro motivo' },
];

function StatusBadge({ status }) {
  const map = {
    approved:               { label: 'Aprobado',               cls: 'bg-green-100 text-green-700' },
    pending:                { label: 'Pendiente',              cls: 'bg-amber-100 text-amber-700' },
    in_process:             { label: 'En proceso',             cls: 'bg-blue-100 text-blue-700' },
    shipped:                { label: 'Enviado',                cls: 'bg-blue-100 text-blue-700' },
    delivered:              { label: 'Entregado',              cls: 'bg-green-100 text-green-700' },
    rejected:               { label: 'Rechazado',             cls: 'bg-error/10 text-error' },
    cancelled:              { label: 'Cancelado',              cls: 'bg-surface-high text-on-surface-variant' },
    cancellation_requested: { label: 'Cancelación solicitada', cls: 'bg-orange-100 text-orange-700' },
  };
  const { label, cls } = map[status] || { label: status, cls: 'bg-surface-high text-on-surface-variant' };
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function OrderCard({ order, onStatusChange, onCancellationDecision, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelNote, setCancelNote]     = useState('');
  const [cancelReason, setCancelReason] = useState('falta_stock');
  const [showAdminCancel, setShowAdminCancel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="border-2 border-outline-variant/40 rounded-xl overflow-hidden shadow-sm">

      {/* ── Header (always visible) ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-3 bg-surface hover:bg-surface-low transition-colors text-left"
      >
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-on-surface-variant">
              #{String(order.id).padStart(5, '0')}
            </span>
            <span className="text-xs text-on-surface-variant">
              {new Date(order.createdAt).toLocaleDateString('es-AR')}
            </span>
          </div>
          <span className="text-sm font-medium text-on-surface truncate">{order.nombreComprador}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm font-headline font-bold text-primary whitespace-nowrap">
              {formatPeso(order.total)}
            </div>
            <StatusBadge status={order.status} />
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 text-on-surface-variant transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {/* ── Expanded body ── */}
      {expanded && (
        <div className="border-t border-outline-variant/20 px-3 py-3 bg-surface-low space-y-3">

          {/* Delivery info */}
          <div className="text-xs text-on-surface-variant">
            <span className="uppercase tracking-widest font-bold text-outline">Entrega:</span>{' '}
            <span className="capitalize">{order.tipoEntrega}</span>
            {order.direccionEnvio && <> — {order.direccionEnvio}</>}
            {order.telefonoComprador && (
              <> · <span>{order.telefonoComprador}</span></>
            )}
          </div>

          {/* MP ids */}
          {(order.mpPreferenceId || order.mpPaymentId) && (
            <div className="flex flex-wrap gap-6 text-xs">
              {order.mpPreferenceId && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-0.5">MP Preference ID</p>
                  <p className="font-mono text-on-surface-variant break-all">{order.mpPreferenceId}</p>
                </div>
              )}
              {order.mpPaymentId && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-0.5">MP Payment ID</p>
                  <p className="font-mono text-on-surface-variant">{order.mpPaymentId}</p>
                </div>
              )}
            </div>
          )}

          {/* Items — lista responsive, sin tabla */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-outline font-bold">Ítems</p>
            {order.OrderItems?.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3 py-2 border-t border-outline-variant/10">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-on-surface truncate">{item.titulo}</p>
                  <p className="text-[10px] text-on-surface-variant">
                    {item.autor || '—'} · <span className="capitalize">{item.edicion}</span> · x{item.qty}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-on-surface">{formatPeso(Number(item.precio) * item.qty)}</p>
                  <p className="text-[10px] text-on-surface-variant">{formatPeso(item.precio)} c/u</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Admin: cancellation request decision ── */}
          {order.status === 'cancellation_requested' && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg space-y-2">
              <p className="text-xs font-bold text-orange-700 uppercase tracking-widest">Solicitud de cancelación</p>
              <p className="text-xs text-orange-600">
                Motivo del cliente: <strong>{CANCEL_REASON_LABELS[order.cancelReason] || order.cancelReason}</strong>
              </p>
              <input
                type="text"
                placeholder="Nota para el cliente (opcional)"
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full border border-orange-200 rounded-lg px-3 py-1.5 text-xs bg-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onCancellationDecision(order.id, 'approve', cancelNote); setCancelNote(''); }}
                  className="px-3 py-1.5 text-xs font-bold bg-error/10 text-error rounded-full hover:bg-error/20 transition-colors"
                >
                  Aprobar cancelación
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onCancellationDecision(order.id, 'reject', cancelNote); setCancelNote(''); }}
                  className="px-3 py-1.5 text-xs font-bold bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  Rechazar (mantener orden)
                </button>
              </div>
            </div>
          )}

          {/* ── Admin: status actions ── */}
          <div className="pt-2 border-t border-outline-variant/10 flex flex-wrap gap-2">
            <span className="text-[10px] uppercase tracking-widest text-outline font-bold w-full">
              Acciones:
            </span>

            {order.status === 'approved' && ['fisico', 'mixto'].includes(order.tipoEntrega) && (
              <button
                onClick={(e) => { e.stopPropagation(); onStatusChange(order.id, 'shipped'); }}
                className="px-3 py-1.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors whitespace-nowrap"
              >
                → Enviado
              </button>
            )}

            {order.status === 'shipped' && (
              <button
                onClick={(e) => { e.stopPropagation(); onStatusChange(order.id, 'delivered'); }}
                className="px-3 py-1.5 text-xs font-bold bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors whitespace-nowrap"
              >
                ✓ Entregado
              </button>
            )}

            {order.status === 'delivered' && (
              <span className={`text-xs px-3 py-1 rounded-full ${order.clientConfirmedDelivery ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {order.clientConfirmedDelivery ? '✓ Confirmado por cliente' : '⏳ Esperando confirmación'}
              </span>
            )}

            <select
              defaultValue=""
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => { if (e.target.value) { onStatusChange(order.id, e.target.value); e.target.value = ''; } }}
              className="text-xs border border-outline-variant rounded-full px-3 py-1.5 bg-surface text-on-surface-variant"
            >
              <option value="" disabled>Cambiar estado…</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="in_process">En proceso</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregado</option>
              <option value="rejected">Rechazado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* ── Admin: cancel order ── */}
          {['approved', 'pending', 'in_process'].includes(order.status) && (
            <div>
              {!showAdminCancel ? (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowAdminCancel(true); }}
                  className="text-xs text-error/60 hover:text-error underline underline-offset-2 transition-colors"
                >
                  Cancelar orden
                </button>
              ) : (
                <div
                  className="p-3 bg-error/5 border border-error/20 rounded-lg space-y-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-xs font-bold text-error">Cancelar orden</p>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg px-3 py-1.5 text-xs bg-surface"
                  >
                    {ADMIN_CANCEL_REASONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Nota adicional para el cliente (opcional)"
                    value={cancelNote}
                    onChange={(e) => setCancelNote(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg px-3 py-1.5 text-xs bg-surface"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onStatusChange(order.id, 'cancelled', cancelNote, cancelReason); setShowAdminCancel(false); setCancelNote(''); }}
                      className="px-3 py-1.5 text-xs font-bold bg-error text-white rounded-full hover:bg-error/90 transition-colors"
                    >
                      Confirmar cancelación
                    </button>
                    <button
                      onClick={() => setShowAdminCancel(false)}
                      className="px-3 py-1.5 text-xs font-bold bg-surface border border-outline-variant text-on-surface-variant rounded-full"
                    >
                      Volver
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Admin: delete order ── */}
          <div className="pt-1" onClick={(e) => e.stopPropagation()}>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-on-surface-variant/40 hover:text-error/70 underline underline-offset-2 transition-colors"
              >
                Eliminar orden
              </button>
            ) : (
              <div className="p-3 bg-error/5 border border-error/20 rounded-lg space-y-2">
                <p className="text-xs font-bold text-error">¿Eliminar definitivamente esta orden?</p>
                <p className="text-xs text-on-surface-variant">Esta acción no se puede deshacer.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onDelete(order.id)}
                    className="px-3 py-1.5 text-xs font-bold bg-error text-white rounded-full hover:bg-error/90 transition-colors"
                  >
                    Sí, eliminar
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 text-xs font-bold bg-surface border border-outline-variant text-on-surface-variant rounded-full"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

const FILTERS = ['Todos', 'Aprobados', 'Pendientes', 'Enviados', 'Cancelaciones', 'Rechazados'];
const FILTER_STATUS = {
  Todos:        null,
  Aprobados:    'approved',
  Pendientes:   'pending',
  Enviados:     'shipped',
  Cancelaciones:'cancellation_requested',
  Rechazados:   'rejected',
};

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('Todos');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus, cancelNote, cancelReason) => {
    try {
      const { data } = await api.patch(`/orders/${orderId}/status`, { status: newStatus, cancelNote, cancelReason });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data } : o));
    } catch { /* silently fail */ }
  };

  const handleCancellationDecision = async (orderId, action, cancelNote) => {
    try {
      const { data } = await api.patch(`/orders/${orderId}/cancel-decision`, { action, cancelNote });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...data } : o));
    } catch { /* silently fail */ }
  };

  const handleDelete = async (orderId) => {
    try {
      await api.delete(`/orders/${orderId}`);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch { /* silently fail */ }
  };

  const statusFilter = FILTER_STATUS[filter];
  const filtered     = statusFilter ? orders.filter(o => o.status === statusFilter) : orders;

  const totalApproved       = orders.filter(o => o.status === 'approved').length;
  const totalPending        = orders.filter(o => o.status === 'pending').length;
  const totalCancelRequests = orders.filter(o => o.status === 'cancellation_requested').length;

  return (
    <AdminLayout>
      {/* Header */}
      <header className="mb-6 lg:mb-12">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-bold tracking-tight text-on-surface">Órdenes</h2>
        <p className="text-on-surface-variant mt-1 text-sm sm:text-base">Gestioná los pedidos de Ediciones Felicitas.</p>
      </header>

      {/* Stats bar — grid 2 cols en mobile, fila en sm+ */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 mb-6 lg:mb-10 p-4 sm:p-6 lg:p-8 bg-surface-low rounded-xl">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Total órdenes</span>
          <span className="text-3xl font-headline italic text-primary">{orders.length}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Aprobados</span>
          <span className="text-3xl font-headline italic text-tertiary">{totalApproved}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Pendientes</span>
          <span className={`text-3xl font-headline italic ${totalPending > 0 ? 'text-amber-600' : 'text-on-surface'}`}>
            {totalPending}
          </span>
        </div>
        {totalCancelRequests > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-orange-600">Cancelaciones</span>
            <span className="text-3xl font-headline italic text-orange-600">{totalCancelRequests}</span>
          </div>
        )}
      </div>

      {/* Filter pills — wrap en mobile */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              filter === f
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-outline-variant mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <p className="font-medium">
            No hay órdenes{filter !== 'Todos' ? ` con estado "${filter.toLowerCase()}"` : ''}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              onCancellationDecision={handleCancellationDecision}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-sm text-on-surface-variant mt-6">
          Mostrando {filtered.length} de {orders.length} órdenes
        </p>
      )}
    </AdminLayout>
  );
}
