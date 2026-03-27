import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Button } from '../../components/ui/Button';

const LibroForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Categories
  const [categories, setCategories] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    editorial: 'Ediciones Felicitas',
    year: '',
    description: '',
    language: 'Español',
    isbn: '',
    hasPhysical: true,
    hasDigital: false,
    physicalPrice: '',
    digitalPrice: '',
    physicalStock: '0',
    isActive: true,
    categories: [] as string[],
  });

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [digitalFile, setDigitalFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const catRes = await api.get('/api/categories');
        setCategories(catRes.data.data);

        if (isEditing) {
          const bookRes = await api.get(`/api/books/${id}`);
          const book = bookRes.data.data;
          setFormData({
            title: book.title || '',
            author: book.author || '',
            editorial: book.editorial || '',
            year: book.year?.toString() || '',
            description: book.description || '',
            language: book.language || '',
            isbn: book.isbn || '',
            hasPhysical: book.hasPhysical,
            hasDigital: book.hasDigital,
            physicalPrice: book.physicalPrice?.toString() || '',
            digitalPrice: book.digitalPrice?.toString() || '',
            physicalStock: book.physicalStock?.toString() || '0',
            isActive: book.isActive,
            categories: book.categories?.map((c: any) => c.id) || [],
          });
        }
      } catch (err) {
        setError('Error al cargar datos. Refrescá la página.');
      } finally {
        setLoading(false);
      }
    };
    fetchBaseData();
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions);
    const selectedValues = options.map((opt) => opt.value);
    setFormData((prev) => ({ ...prev, categories: selectedValues }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isDigital = false) => {
    if (e.target.files && e.target.files[0]) {
      if (isDigital) setDigitalFile(e.target.files[0]);
      else setCoverImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Preparamos FormData (multipart/form-data)
    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'categories') {
        fd.append('categories', JSON.stringify(formData.categories));
      } else {
        fd.append(key, String((formData as any)[key]));
      }
    });

    if (coverImageFile) fd.append('coverImage', coverImageFile);
    if (digitalFile) fd.append('digitalFile', digitalFile);

    try {
      if (isEditing) {
        await api.put(`/api/admin/books/${id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/api/admin/books', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      navigate('/admin/libros');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ocurrió un error al guardar el libro.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 className="admin-page-title">{isEditing ? 'Editar Libro' : 'Nuevo Libro'}</h1>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Info Básica */}
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#1e1b30' }}>Información Principal</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Título *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Autor *</label>
              <input type="text" name="author" value={formData.author} onChange={handleChange} required style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Descripción corta</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }} />
          </div>
        </fieldset>

        {/* Formatos y Precios */}
        <fieldset style={{ border: 'none', padding: 0, margin: 0, borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
          <legend style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#1e1b30' }}>Formatos y Stock</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            {/* Box Físico */}
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                <input type="checkbox" name="hasPhysical" checked={formData.hasPhysical} onChange={handleChange} />
                Formato Físico Disponible
              </label>
              {formData.hasPhysical && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem' }}>Precio (ARS) *</label>
                    <input type="number" name="physicalPrice" value={formData.physicalPrice} onChange={handleChange} required={formData.hasPhysical} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem' }}>Stock actual *</label>
                    <input type="number" name="physicalStock" value={formData.physicalStock} onChange={handleChange} required={formData.hasPhysical} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Box Digital */}
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                <input type="checkbox" name="hasDigital" checked={formData.hasDigital} onChange={handleChange} />
                E-Book Disponible
              </label>
              {formData.hasDigital && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem' }}>Precio (ARS) *</label>
                    <input type="number" name="digitalPrice" value={formData.digitalPrice} onChange={handleChange} required={formData.hasDigital} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem' }}>Archivo PDF (Max 100MB)</label>
                    <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, true)} style={{ fontSize: '0.875rem' }} />
                    <small style={{ color: '#6e6884' }}>Si ya tiene archivo, subir uno nuevo lo reemplazará.</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </fieldset>

        {/* Archivos e Info Extra */}
        <fieldset style={{ border: 'none', padding: 0, margin: 0, borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
          <legend style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#1e1b30' }}>Metadatos y Multimedia</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Imagen de Portada</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFileChange(e, false)} style={{ fontSize: '0.875rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Categorías (Ctrl+Click para varias)</label>
              <select multiple name="categories" value={formData.categories} onChange={handleCategoryChange} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', height: '100px' }}>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>ISBN</label>
              <input type="text" name="isbn" value={formData.isbn} onChange={handleChange} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Año</label>
              <input type="number" name="year" value={formData.year} onChange={handleChange} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
          </div>
        </fieldset>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1.5rem', justifyContent: 'flex-end' }}>
          <Button variant="ghost" type="button" onClick={() => navigate('/admin/libros')}>Cancelar</Button>
          <Button type="submit" isLoading={saving}>{isEditing ? 'Guardar Cambios' : 'Crear Libro'}</Button>
        </div>
      </form>
    </div>
  );
};

export default LibroForm;
