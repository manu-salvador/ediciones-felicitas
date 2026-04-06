import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import Spinner from '../components/ui/Spinner';
import api from '../services/api';

const formatPeso = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

function StatusBadge({ status }) {
  const map = {
    approved:   { label: 'Aprobado',   cls: 'bg-green-100 text-green-700' },
    pending:    { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700' },
    in_process: { label: 'En proceso', cls: 'bg-blue-100 text-blue-700' },
    shipped:    { label: 'Enviado',    cls: 'bg-blue-100 text-blue-700' },
    delivered:  { label: 'Entregado',  cls: 'bg-green-100 text-green-700' },
    rejected:   { label: 'Rechazado',  cls: 'bg-error/10 text-error' },
    cancelled:  { label: 'Cancelado',  cls: 'bg-surface-high text-on-surface-variant' },
  };
  const { label, cls } = map[status] || { label: status, cls: 'bg-surface-high text-on-surface-variant' };
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function OrderRow({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="border-b border-outline-variant/20 hover:bg-surface-low cursor-pointer transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="py-4 px-4 text-sm font-mono text-on-surface-variant whitespace-nowrap">
          #{String(order.id).padStart(5, '0')}
        </td>
        <td className="py-4 px-4 text-sm text-on-surface whitespace-nowrap">
          {new Date(order.createdAt).toLocaleDateString('es-AR')}
        </td>
        <td className="py-4 px-4">
          <p className="text-sm font-medium text-on-surface">{order.nombreComprador}</p>
          <p className="text-xs text-on-surface-variant">{order.emailComprador}</p>
          {order.telefonoComprador && (
            <p className="text-xs text-on-surface-variant">{order.telefonoComprador}</p>
          )}
        </td>
        <td className="py-4 px-4">
          {order.OrderItems?.map((item, idx) => (
            <div key={idx} className="text-xs text-on-surface-variant">
              {item.titulo} × {item.qty}
              <span className="ml-1 text-[10px] uppercase tracking-widest text-outline">({item.edicion})</span>
            </div>
          ))}
        </td>
        <td className="py-4 px-4 text-sm text-on-surface">
          {order.tipoEntrega === 'digital' ? (
            <span className="text-xs text-on-surface-variant italic">Digital</span>
          ) : (
            <span className="text-xs text-on-surface-variant">{order.direccionEnvio || '—'}</span>
          )}
        </td>
        <td className="py-4 px-4 text-sm font-headline font-bold text-primary whitespace-nowrap">
          {formatPeso(order.total)}
        </td>
        <td className="py-4 px-4">
          <StatusBadge status={order.status} />
        </td>
        <td className="py-4 px-4 text-on-surface-variant">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-surface-low border-b border-outline-variant/20">
          <td colSpan={8} className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-1">ID de orden</p>
                <p className="font-mono text-on-surface">#{String(order.id).padStart(5, '0')}</p>
              </div>
              {order.mpPreferenceId && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-1">MP Preference ID</p>
                  <p className="font-mono text-on-surface break-all">{order.mpPreferenceId}</p>
                </div>
              )}
              {order.mpPaymentId && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-1">MP Payment ID</p>
                  <p className="font-mono text-on-surface">{order.mpPaymentId}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-1">Tipo de entrega</p>
                <p className="text-on-surface capitalize">{order.tipoEntrega}</p>
              </div>
              {order.direccionEnvio && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-1">Dirección</p>
                  <p className="text-on-surface">{order.direccionEnvio}</p>
                </div>
              )}
              <div className="sm:col-span-2">
                <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-2">Items</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-outline uppercase tracking-widest text-[10px]">
                      <th className="pb-1">Título</th>
                      <th className="pb-1">Autor</th>
                      <th className="pb-1">Edición</th>
                      <th className="pb-1 text-right">Precio</th>
                      <th className="pb-1 text-right">Cant.</th>
                      <th className="pb-1 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.OrderItems?.map((item, idx) => (
                      <tr key={idx} className="border-t border-outline-variant/10">
                        <td className="py-1.5 text-on-surface font-medium">{item.titulo}</td>
                        <td className="py-1.5 text-on-surface-variant">{item.autor || '—'}</td>
                        <td className="py-1.5 capitalize text-on-surface-variant">{item.edicion}</td>
                        <td className="py-1.5 text-right text-on-surface">{formatPeso(item.precio)}</td>
                        <td className="py-1.5 text-right text-on-surface">{item.qty}</td>
                        <td className="py-1.5 text-right font-bold text-on-surface">{formatPeso(Number(item.precio) * item.qty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Status actions for physical/mixed orders */}
                {['fisico', 'mixto'].includes(order.tipoEntrega) && (
                  <div className="mt-4 pt-3 border-t border-outline-variant/10 flex flex-wrap gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-outline font-bold self-center mr-2">Actualizar estado:</span>
                    {order.status === 'approved' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onStatusChange(order.id, 'shipped'); }}
                        className="px-3 py-1.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        Marcar como enviado
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onStatusChange(order.id, 'delivered'); }}
                        className="px-3 py-1.5 text-xs font-bold bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                      >
                        Marcar como entregado
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const FILTERS = ['Todos', 'Aprobados', 'Pendientes', 'Enviados', 'Rechazados'];
const FILTER_STATUS = {
  Todos: null,
  Aprobados: 'approved',
  Pendientes: 'pending',
  Enviados: 'shipped',
  Rechazados: 'rejected',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch {
      // silently fail — could add toast here
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch {
      // could add toast
    }
  };

  const statusFilter = FILTER_STATUS[filter];
  const filtered = statusFilter ? orders.filter(o => o.status === statusFilter) : orders;

  const totalApproved = orders.filter(o => o.status === 'approved').length;
  const totalPending = orders.filter(o => o.status === 'pending').length;

  return (
    <AdminLayout>
      {/* Header */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-5xl font-headline font-bold tracking-tight text-on-surface">Órdenes</h2>
          <p className="text-on-surface-variant mt-2">Gestioná los pedidos de Ediciones Felicitas.</p>
        </div>
      </header>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-6 mb-10 p-8 bg-surface-low rounded-xl">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Total órdenes</span>
          <span className="text-3xl font-headline italic text-primary">{orders.length}</span>
        </div>
        <div className="w-px bg-outline-variant/30 self-stretch hidden sm:block" />
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Aprobados</span>
          <span className="text-3xl font-headline italic text-tertiary">{totalApproved}</span>
        </div>
        <div className="w-px bg-outline-variant/30 self-stretch hidden sm:block" />
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Pendientes</span>
          <span className={`text-3xl font-headline italic ${totalPending > 0 ? 'text-amber-600' : 'text-on-surface'}`}>{totalPending}</span>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              filter === f
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-outline-variant mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <p className="font-medium">No hay órdenes{filter !== 'Todos' ? ` con estado "${filter.toLowerCase()}"` : ''}.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-outline-variant/20">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-low border-b border-outline-variant/20">
                <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-outline font-bold">#ID</th>
                <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-outline font-bold">Fecha</th>
                <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-outline font-bold">Comprador</th>
                <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-outline font-bold">Libros</th>
                <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-outline font-bold">Entrega</th>
                <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-outline font-bold">Total</th>
                <th className="py-3 px-4 text-[10px] uppercase tracking-widest text-outline font-bold">Estado</th>
                <th className="py-3 px-4 w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-sm text-on-surface-variant mt-4">
          Mostrando {filtered.length} de {orders.length} órdenes
        </p>
      )}
    </AdminLayout>
  );
}
