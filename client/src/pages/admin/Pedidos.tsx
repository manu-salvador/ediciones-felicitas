import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const Pedidos: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/admin/orders');
        setOrders(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', fontWeight: 600 }}>Aprobado</span>;
      case 'pending': return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 600 }}>Pendiente MP</span>;
      case 'rejected': return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#fee2e2', color: '#991b1b', fontSize: '0.75rem', fontWeight: 600 }}>Rechazado</span>;
      default: return <span>{status}</span>;
    }
  };

  const getFulfillmentBadge = (status: string) => {
    switch (status) {
      case 'fulfilled': return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 600 }}>Enviado</span>;
      case 'pending': return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#f3f4f6', color: '#374151', fontSize: '0.75rem', fontWeight: 600 }}>A Preparar</span>;
      case 'digital_only': return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#f3e8ff', color: '#6b21a8', fontSize: '0.75rem', fontWeight: 600 }}>Solo E-Book</span>;
      default: return <span>{status}</span>;
    }
  };

  if (loading) return <div>Cargando pedidos...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Gestión de Pedidos</h1>
        <button style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid #e4e2ec', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
          Exportar CSV
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e4e2ec' }}>
              <th style={{ padding: '1rem', color: '#6e6884', fontWeight: 500, fontSize: '0.875rem' }}>Nro. Pedido</th>
              <th style={{ padding: '1rem', color: '#6e6884', fontWeight: 500, fontSize: '0.875rem' }}>Fecha</th>
              <th style={{ padding: '1rem', color: '#6e6884', fontWeight: 500, fontSize: '0.875rem' }}>Total</th>
              <th style={{ padding: '1rem', color: '#6e6884', fontWeight: 500, fontSize: '0.875rem' }}>Pago (MP)</th>
              <th style={{ padding: '1rem', color: '#6e6884', fontWeight: 500, fontSize: '0.875rem' }}>Envío</th>
              <th style={{ padding: '1rem', color: '#6e6884', fontWeight: 500, fontSize: '0.875rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #e4e2ec' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#1e1b30' }}>
                  {order.orderNumber}
                </td>
                <td style={{ padding: '1rem', color: '#4b5563', fontSize: '0.875rem' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem', fontWeight: 500, color: '#1e1b30' }}>
                  ${Number(order.total).toLocaleString('es-AR')}
                </td>
                <td style={{ padding: '1rem' }}>{getStatusBadge(order.status)}</td>
                <td style={{ padding: '1rem' }}>{getFulfillmentBadge(order.fulfillmentStatus)}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <Link to={`/admin/pedidos/${order.id}`} style={{ color: '#7f4ef0', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                    Ver Detalle &rarr;
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6e6884' }}>
                  Aún no hay pedidos en la plataforma.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Pedidos;
