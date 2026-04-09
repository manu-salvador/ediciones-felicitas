import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import BookTable from '../components/admin/BookTable';
import BookForm from '../components/admin/BookForm';
import DeleteModal from '../components/admin/DeleteModal';
import Spinner from '../components/ui/Spinner';
import api from '../services/api';

const formatPeso = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

export default function AdminBooksPage({ openForm: openFormProp = false }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');   // mensaje flotante (éxito o error)
  const [toastType, setToastType] = useState('error'); // 'error' | 'success'

  const [showForm, setShowForm] = useState(openFormProp);
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);
  const [search, setSearch] = useState('');
  const [formTouched, setFormTouched] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const showToast = (msg, type = 'error') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const fetchBooks = useCallback(async () => {
    try {
      const { data } = await api.get('/books/admin');
      setBooks(data);
    } catch {
      showToast('No se pudieron cargar los libros. Verificá la conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleEdit = (book) => { setEditingBook(book); setShowForm(true); setFormTouched(false); };
  const handleDelete = (book) => setDeletingBook(book);

  const handleToggleActive = async (id, newActivo) => {
    try {
      await api.put(`/books/${id}`, { activo: newActivo });
      setBooks(prev => prev.map(b => b.id === id ? { ...b, activo: newActivo } : b));
      showToast(newActivo ? 'Libro activado.' : 'Libro desactivado.', 'success');
    } catch {
      showToast('Error al cambiar el estado del libro.');
    }
  };

  // Intento de cerrar el formulario: pide confirmación si hay cambios sin guardar
  const handleCloseForm = () => {
    if (formTouched) {
      setShowDiscardConfirm(true);
    } else {
      setShowForm(false);
      setEditingBook(null);
      setFormTouched(false);
    }
  };

  const handleConfirmDiscard = () => {
    setShowForm(false);
    setEditingBook(null);
    setFormTouched(false);
    setShowDiscardConfirm(false);
  };

  const handleFormSubmit = async (formData) => {
    setSaving(true);
    try {
      if (editingBook) {
        await api.put(`/books/${editingBook.id}`, formData);
      } else {
        await api.post('/books', formData);
      }
      setShowForm(false);
      setEditingBook(null);
      setFormTouched(false);
      await fetchBooks();
      showToast(editingBook ? 'Libro actualizado correctamente.' : 'Libro creado correctamente.', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Error al guardar el libro.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/books/${deletingBook.id}`);
      setDeletingBook(null);
      await fetchBooks();
      showToast('Libro desactivado.', 'success');
    } catch {
      showToast('Error al desactivar el libro.');
    } finally {
      setSaving(false);
    }
  };

  const activeBooks = books.filter((b) => b.activo);
  const sinStock = activeBooks.filter((b) => Number(b.stock ?? 0) === 0).length;
  const totalStock = books.reduce((sum, b) => sum + Number(b.stock ?? 0), 0);

  const filtered = books.filter(
    (b) =>
      b.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (b.autor || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 lg:mb-12">
        <div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-bold tracking-tight text-on-surface">Inventario</h2>
          <p className="text-on-surface-variant mt-1 text-sm sm:text-base">Gestioná el catálogo de libros de Ediciones Felicitas.</p>
        </div>
        <button
          onClick={() => { setEditingBook(null); setShowForm(true); setFormTouched(false); }}
          className="flex items-center justify-center gap-3 bg-primary text-on-primary px-6 py-3 lg:px-8 lg:py-4 rounded-full font-bold hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all w-full sm:w-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Añadir Libro</span>
        </button>
      </header>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 sm:gap-6 mb-6 lg:mb-10 p-4 sm:p-6 lg:p-8 bg-surface-low rounded-xl">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Total títulos</span>
          <span className="text-3xl font-headline italic text-primary">{books.length}</span>
        </div>
        <div className="w-px bg-outline-variant/30 self-stretch hidden sm:block" />
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Activos</span>
          <span className="text-3xl font-headline italic text-on-surface">{activeBooks.length}</span>
        </div>
        <div className="w-px bg-outline-variant/30 self-stretch hidden sm:block" />
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Sin stock</span>
          <span className={`text-3xl font-headline italic ${sinStock > 0 ? 'text-error' : 'text-on-surface'}`}>
            {sinStock}
          </span>
        </div>
        <div className="w-px bg-outline-variant/30 self-stretch hidden sm:block" />
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Unidades en stock</span>
          <span className={`text-3xl font-headline italic ${totalStock < 10 ? 'text-error' : 'text-on-surface'}`}>{totalStock}</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título o autor…"
          className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
        />
      </div>

      {/* Table */}
      {loading ? <Spinner /> : <BookTable books={filtered} onEdit={handleEdit} onDelete={handleDelete} onToggleActive={handleToggleActive} />}

      {/* Pagination hint */}
      {!loading && filtered.length > 0 && (
        <div className="flex justify-between items-center mt-8 pb-4">
          <span className="text-sm text-on-surface-variant">
            Mostrando {filtered.length} de {books.length} libros
          </span>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[92vh] overflow-y-auto relative">
            <div className="p-5 sm:p-8 lg:p-10">
              {/* Modal header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-headline font-bold tracking-tight text-primary">
                    {editingBook ? editingBook.titulo : 'Añadir Nuevo Libro'}
                  </h3>
                  {editingBook && (
                    <p className="text-on-surface-variant mt-1 italic text-sm">
                      ID: BK-{String(editingBook.id).padStart(5, '0')}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleCloseForm}
                  className="text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-low transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <BookForm
                book={editingBook}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseForm}
                loading={saving}
                onFormChange={() => setFormTouched(true)}
              />
            </div>

            {/* Discard confirmation overlay */}
            {showDiscardConfirm && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 max-w-sm mx-6 text-center shadow-2xl">
                  <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <h4 className="font-headline text-xl font-bold text-on-surface mb-2">¿Descartás los cambios?</h4>
                  <p className="text-sm text-on-surface-variant mb-6">Los datos modificados se perderán.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDiscardConfirm(false)}
                      className="flex-1 border border-outline-variant text-on-surface-variant font-medium py-3 px-4 rounded-full hover:bg-surface-low transition-colors text-sm"
                    >
                      Seguir editando
                    </button>
                    <button
                      onClick={handleConfirmDiscard}
                      className="flex-1 bg-error text-white font-bold py-3 px-4 rounded-full hover:opacity-90 active:scale-95 transition-all text-sm"
                    >
                      Sí, descartar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        book={deletingBook}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingBook(null)}
        loading={saving}
      />

      {/* Toast notification */}
      {toastMsg && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl text-sm font-medium transition-all ${toastType === 'success' ? 'bg-tertiary text-white' : 'bg-error text-white'}`}>
          {toastType === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          )}
          {toastMsg}
        </div>
      )}
    </AdminLayout>
  );
}
