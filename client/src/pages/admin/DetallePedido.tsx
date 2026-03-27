import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';

const DetallePedido: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [trackingCode, setTrackingCode] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/api/admin/orders/${id}`);
        setOrder(data.data);
        setTrackingCode(data.data.shippingTrackingCode || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleUpdateFulfillment = async (newStatus: string) => {
    setUpdating(true);
    try {
      await api.patch(`/api/admin/orders/${id}/fulfillment`, {
        fulfillmentStatus: newStatus,
        shippingTrackingCode: trackingCode || null
      });
      // Recargar datos
      const { data } = await api.get(`/api/admin/orders/${id}`);
      setOrder(data.data);
      alert('Estado de envío actualizado.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar envío.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div>Cargando pedido...</div>;
  if (!order) return <div>Pedido no encontrado.</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/admin/pedidos" style={{ color: '#6e6884', textDecoration: 'none' }}>&larr; Volver</Link>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Pedido {order.orderNumber}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Info Comprador */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#1e1b30', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Datos del Comprador</h3>
          <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563' }}><strong>Nombre:</strong> {order.guestData?.firstName || order.User?.firstName} {order.guestData?.lastName || order.User?.lastName}</p>
          <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563' }}><strong>Email:</strong> {order.guestData?.email || order.User?.email}</p>
          <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563' }}><strong>Teléfono:</strong> {order.guestData?.phone || order.User?.phone}</p>
          
          {order.invoiceRequested && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, fontSize: '0.875rem' }}>Factura Solicitada</p>
              <p style={{ margin: '0', fontSize: '0.875rem' }}>CUIT: {order.invoiceData?.cuit}</p>
              <p style={{ margin: '0', fontSize: '0.875rem' }}>Razón: {order.invoiceData?.businessName}</p>
            </div>
          )}
        </div>

        {/* Info Envío & Pago */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#1e1b30', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Pago y Envío</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#4b5563' }}>Estado Pago:</span>
            <strong style={{ color: order.status === 'approved' ? '#16a34a' : '#ea580c' }}>{order.status.toUpperCase()}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ color: '#4b5563' }}>Estado Envío:</span>
            <strong>{order.fulfillmentStatus.toUpperCase()}</strong>
          </div>

          <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563' }}>
            <strong>Dirección: </strong> 
            {order.shippingAddress ? `${order.shippingAddress.street} ${order.shippingAddress.number}, ${order.shippingAddress.city}, ${order.shippingAddress.state} (${order.shippingAddress.zip})` : 'Digital'}
          </p>

          <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563' }}>
            <strong>Pago MP (ID): </strong> {order.mpPaymentId || '-'}
          </p>
        </div>
      </div>

      {/* Items */}
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#1e1b30', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Artículos del Pedido</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e4e2ec', color: '#6e6884', fontSize: '0.875rem' }}>
              <th style={{ padding: '0.5rem' }}>Libro</th>
              <th style={{ padding: '0.5rem' }}>Tipo</th>
              <th style={{ padding: '0.5rem' }}>Precio Unit.</th>
              <th style={{ padding: '0.5rem' }}>Cant.</th>
              <th style={{ padding: '0.5rem', textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.OrderItems.map((item: any) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                <td style={{ padding: '0.5rem', fontWeight: 500 }}>{item.Book?.title || 'Libro eliminado'}</td>
                <td style={{ padding: '0.5rem' }}>{item.type === 'physical' ? 'Físico' : 'Digital'}</td>
                <td style={{ padding: '0.5rem' }}>${Number(item.unitPrice).toLocaleString('es-AR')}</td>
                <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 500 }}>${Number(item.subtotal).toLocaleString('es-AR')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot style={{ background: '#f8f9fa' }}>
            <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'right' }}>Subtotal</td><td style={{ padding: '1rem', textAlign: 'right' }}>${Number(order.subtotal).toLocaleString('es-AR')}</td></tr>
            <tr><td colSpan={4} style={{ padding: '1rem 1rem 0', textAlign: 'right' }}>Costo Envío</td><td style={{ padding: '1rem 1rem 0', textAlign: 'right' }}>${Number(order.shippingCost).toLocaleString('es-AR')}</td></tr>
            <tr>
               <td colSpan={4} style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.125rem', color: '#1e1b30' }}>Total</td>
               <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.125rem', color: '#1e1b30' }}>${Number(order.total).toLocaleString('es-AR')}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Gestión Envío Físico */}
      {order.fulfillmentStatus !== 'digital_only' && (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '4px solid #7f4ef0' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#1e1b30' }}>Gestión de Paquete Físico</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Código de Seguimiento (Opcional)</label>
              <input 
                type="text" 
                value={trackingCode} 
                onChange={(e) => setTrackingCode(e.target.value)} 
                placeholder="Ej. AR123456789"
                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }} 
              />
            </div>
            <Button 
              onClick={() => handleUpdateFulfillment('fulfilled')} 
              isLoading={updating}
              disabled={order.fulfillmentStatus === 'fulfilled'}
            >
              {order.fulfillmentStatus === 'fulfilled' ? 'Actualizar Tracking' : 'Marcar como Enviado'}
            </Button>
            {order.fulfillmentStatus === 'fulfilled' && (
              <Button 
                variant="secondary"
                onClick={() => handleUpdateFulfillment('pending')} 
                isLoading={updating}
              >
                Revertir a Pendiente
              </Button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default DetallePedido;
