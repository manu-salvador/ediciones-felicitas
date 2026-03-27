import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';

const Libros: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      const { data } = await api.get('/api/books?limit=1000');
      setBooks(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar el libro "${title}"? Esta acción no se puede deshacer.`)) {
      try {
        await api.delete(`/api/admin/books/${id}`);
        fetchBooks();
      } catch (err) {
        alert('Error al eliminar libro. Es posible que tenga pedidos asociados.');
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await api.patch(`/api/admin/books/${id}/toggle-active`);
      fetchBooks();
    } catch (err) {
      alert('Error al cambiar el estado del libro.');
    }
  };

  if (loading) return <div>Cargando libros...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>Gestión de Libros</h1>
        <Link to="/admin/libros/nuevo">
          <Button>+ Nuevo Libro</Button>
        </Link>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e4e2ec' }}>
              <th style={{ padding: '1rem', color: '#6e6884', fontWeight: 500, fontSize: '0.875rem' }}>Título</th>
              <th style={{ padding: '1rem', color: '#6e6884', fontWeight: 500, fontSize: '0.875rem' }}>Autor</th>
              <th style={{ padding: '1rem', color: '#6e6884', fontWeight: 500, fontSize: '0.875rem' }}>Stock Físico</th>
              <th style={{ padding: '1rem', color: '#6e6884', fontWeight: 500, fontSize: '0.875rem' }}>Estado</th>
              <th style={{ padding: '1rem', color: '#6e6884', fontWeight: 500, fontSize: '0.875rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.id} style={{ borderBottom: '1px solid #e4e2ec' }}>
                <td style={{ padding: '1rem', fontWeight: 500, color: '#1e1b30' }}>
                  {book.title}
                  <div style={{ fontSize: '0.75rem', color: '#8a85a0', marginTop: '4px' }}>
                    {book.hasPhysical && 'Físico '}{book.hasPhysical && book.hasDigital && '| '}{book.hasDigital && 'Digital'}
                  </div>
                </td>
                <td style={{ padding: '1rem', color: '#4b5563' }}>{book.author}</td>
                <td style={{ padding: '1rem', color: '#4b5563' }}>
                  {book.hasPhysical ? book.physicalStock : '-'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                    background: book.isActive ? '#d1fae5' : '#fee2e2',
                    color: book.isActive ? '#065f46' : '#991b1b'
                  }}>
                    {book.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleToggleActive(book.id)}
                      style={{ background: 'none', border: 'none', color: '#4e4b66', cursor: 'pointer', fontSize: '0.875rem' }}
                      title={book.isActive ? 'Desactivar' : 'Activar'}
                    >
                      👁️
                    </button>
                    <Link to={`/admin/libros/${book.id}/editar`} style={{ color: '#7f4ef0', textDecoration: 'none', fontSize: '0.875rem' }}>
                      ✏️ Editar
                    </Link>
                    <button 
                      onClick={() => handleDelete(book.id, book.title)}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.875rem' }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {books.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6e6884' }}>
                  No hay libros registrados en la plataforma.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Libros;
