import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';

const Categorias: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/api/categories');
      setCategories(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingId) {
        await api.put(`/api/admin/categories/${editingId}`, { name });
      } else {
        await api.post('/api/admin/categories', { name });
      }
      setName('');
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar categoría');
    }
  };

  const handleEdit = (cat: any) => {
    setName(cat.name);
    setEditingId(cat.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar esta categoría? Los libros asociados no se borrarán pero perderán la etiqueta.')) {
      try {
        await api.delete(`/api/admin/categories/${id}`);
        fetchCategories();
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  if (loading) return <div>Cargando categorías...</div>;

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 className="admin-page-title">Gestión de Categorías</h1>

      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#1e1b30' }}>
          {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Nombre de la categoría..."
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <Button type="submit">{editingId ? 'Guardar' : 'Agregar'}</Button>
          {editingId && <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setName(''); }}>Cancelar</Button>}
        </form>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e4e2ec' }}>
              <th style={{ padding: '1rem', color: '#6e6884', fontWeight: 500, fontSize: '0.875rem' }}>Nombre</th>
              <th style={{ padding: '1rem', color: '#6e6884', fontWeight: 500, fontSize: '0.875rem' }}>Slug</th>
              <th style={{ padding: '1rem', color: '#6e6884', fontWeight: 500, fontSize: '0.875rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                <td style={{ padding: '1rem', fontWeight: 500, color: '#1e1b30' }}>{cat.name}</td>
                <td style={{ padding: '1rem', color: '#6e6884' }}>{cat.slug}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => handleEdit(cat)} style={{ background: 'none', border: 'none', color: '#7f4ef0', cursor: 'pointer', marginRight: '1rem', fontSize: '0.875rem' }}>Editar</button>
                  <button onClick={() => handleDelete(cat.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.875rem' }}>Eliminar</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#6e6884' }}>No hay categorías.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categorias;
