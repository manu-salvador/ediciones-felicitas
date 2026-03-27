import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    activeBooks: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ⚠️ MVP: Idealmente habría un endpoint /api/admin/metrics
    // Aquí simulamos cómo cargar varias listas o endpoints existentes para deducir métricas base si es necesario,
    // o pedimos directo a un hipotético endpoint.
    // Como no hicimos el endpoint de /metrics en el back (TBD en MVP avanzado), haremos un fetch manual a /api/admin/orders y /books.
    const fetchDashboardInfo = async () => {
      try {
        const [ordersRes, booksRes] = await Promise.all([
          api.get('/api/admin/orders?limit=1000'),
          api.get('/api/books?limit=1000') // fetch público sirve para contar
        ]);

        const orders = ordersRes.data.data;
        const total = orders.reduce((sum: number, o: any) => sum + Number(o.total), 0);
        const pending = orders.filter((o: any) => o.status === 'pending' || o.fulfillmentStatus === 'pending').length;

        setStats({
          totalOrders: orders.length,
          pendingOrders: pending,
          activeBooks: booksRes.data.data.length,
          totalRevenue: total,
        });
      } catch (error) {
        console.error('Error fetching dashboard info', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardInfo();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Cargando panel...</div>;

  return (
    <div>
      <h1 className="admin-page-title">Panel de Control</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '4px solid #7f4ef0' }}>
          <h3 style={{ color: '#6e6884', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Ventas Totales
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1e1b30' }}>
            ${stats.totalRevenue.toLocaleString('es-AR')}
          </p>
        </div>

        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ color: '#6e6884', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Pedidos Realizados
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1e1b30' }}>
            {stats.totalOrders}
          </p>
        </div>

        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ color: '#6e6884', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Envíos Pendientes
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1e1b30' }}>
            {stats.pendingOrders}
          </p>
        </div>

        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ color: '#6e6884', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Títulos en Catálogo
          </h3>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: '#1e1b30' }}>
            {stats.activeBooks}
          </p>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1e1b30' }}>Acciones Rápidas</h2>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <li><a href="/admin/pedidos" style={{ display: 'block', padding: '0.75rem 1.5rem', background: '#f8f9fa', borderRadius: '8px', textDecoration: 'none', color: '#4b5563', fontWeight: 500 }}>Procesar Pedidos</a></li>
          <li><a href="/admin/libros/nuevo" style={{ display: 'block', padding: '0.75rem 1.5rem', background: '#f8f9fa', borderRadius: '8px', textDecoration: 'none', color: '#4b5563', fontWeight: 500 }}>Subir Libro Nuevo</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
