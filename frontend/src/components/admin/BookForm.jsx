import { useState, useEffect } from 'react';
import api from '../../services/api';
import { makeSanitizedHandler } from '../../utils/sanitize';

const EMPTY = { titulo: '', isbn: '', precio: '', autor: '', categoria: '', imagen: '', archivoDigital: '', tieneDigital: false, stock: 0, paginas: '' };

const CATEGORIAS = [
  'Narrativa', 'Poesía', 'Historia', 'Biografía',
  'Infantil', 'Ensayo', 'Filosofía', 'Arte & Diseño', 'Otro',
];

const inputClass =
  'w-full bg-surface-high border-none rounded-lg px-6 py-4 text-on-surface focus:ring-2 focus:ring-primary/30 transition-all outline-none';
const labelClass =
  'block text-[0.625rem] font-bold uppercase tracking-widest text-outline mb-3';

function FileUploadField({ label, accept, type, value, onChange, hint }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post(`/upload/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data.url);
    } catch (e) {
      setErr(e.response?.data?.error || 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <label className="flex items-center gap-4 cursor-pointer">
        <span className={`px-5 py-3 rounded-lg border-2 border-dashed text-xs font-bold uppercase tracking-widest transition-colors ${uploading ? 'border-outline-variant text-outline' : 'border-primary/30 text-primary hover:border-primary hover:bg-primary/5'}`}>
          {uploading ? 'Subiendo…' : 'Elegir archivo'}
        </span>
        <input type="file" accept={accept} onChange={handleFile} className="hidden" disabled={uploading} />
        {value && <span className="text-xs text-on-surface-variant truncate max-w-xs">{value.split('/').pop()}</span>}
      </label>
      {hint && <p className="text-xs text-on-surface-variant mt-1">{hint}</p>}
      {err && <p className="text-xs text-error mt-1">{err}</p>}
    </div>
  );
}

export default function BookForm({ book, onSubmit, onCancel, loading, onFormChange }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(book
      ? {
          titulo: book.titulo || '',
          isbn: book.isbn || '',
          precio: book.precio || '',
          autor: book.autor || '',
          categoria: book.categoria || '',
          imagen: book.imagen || '',
          archivoDigital: book.archivoDigital || '',
          tieneDigital: book.tieneDigital ?? false,
          stock: book.stock ?? 0,
          paginas: book.paginas || '',
        }
      : EMPTY
    );
    setError('');
  }, [book]);

  const baseHandleChange = makeSanitizedHandler(setForm);
  const handleChange = (e) => { baseHandleChange(e); onFormChange?.(); };
  const clearError = () => setError('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) return setError('El título es obligatorio');
    if (!form.precio || isNaN(Number(form.precio))) return setError('Ingresá un precio válido');
    onSubmit({ ...form, precio: Number(form.precio), paginas: form.paginas ? Number(form.paginas) : null });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6 lg:gap-10">
      {/* Left: Cover preview */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="bg-surface-low p-6 rounded-lg">
          <p className={labelClass}>Portada actual</p>
          <div className="aspect-[3/4] rounded-sm shadow-lg overflow-hidden bg-surface-high flex items-center justify-center mb-4">
            {form.imagen ? (
              <img src={form.imagen} alt="Portada" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-outline">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-2 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <p className="text-xs">Sin imagen</p>
              </div>
            )}
          </div>
          <FileUploadField
            label="Subir portada"
            accept="image/jpeg,image/png,image/webp"
            type="libros"
            value={form.imagen}
            onChange={(url) => { setForm((f) => ({ ...f, imagen: url })); onFormChange?.(); }}
            hint="JPG, PNG o WebP — máx. 15 MB"
          />
        </div>
      </div>

      {/* Right: Form fields */}
      <div className="col-span-12 lg:col-span-8 space-y-6 bg-surface-low p-4 sm:p-6 lg:p-8 rounded-xl">
        {/* Título */}
        <div>
          <label className={labelClass}>Título de la Obra *</label>
          <input
            name="titulo"
            value={form.titulo}
            onChange={(e) => { handleChange(e); clearError(); }}
            maxLength={150}
            className={`${inputClass} font-headline text-xl text-primary`}
            placeholder="Ej. Macacha Güemes"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className={labelClass}>Autor</label>
            <input name="autor" value={form.autor} onChange={handleChange} maxLength={100} className={inputClass} placeholder="Nombre del autor" />
          </div>
          <div>
            <label className={labelClass}>Género</label>
            <select name="categoria" value={form.categoria} onChange={handleChange} className={`${inputClass} appearance-none`}>
              <option value="">Sin género</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className={labelClass}>Precio (ARS) *</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 font-headline text-outline">$</span>
              <input
                name="precio"
                type="number"
                min="0"
                value={form.precio}
                onChange={handleChange}
                className={`${inputClass} pl-9 font-headline text-xl`}
                placeholder="25000"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Stock disponible</label>
            <input
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              className={`${inputClass} font-headline text-xl`}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Número de páginas</label>
          <input
            name="paginas"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={form.paginas}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '');
              setForm((f) => ({ ...f, paginas: v }));
              onFormChange?.();
            }}
            className={`${inputClass} font-headline text-xl`}
            placeholder="320"
          />
        </div>

        <div>
          <label className={labelClass}>ISBN</label>
          <input
            name="isbn"
            value={form.isbn}
            onChange={handleChange}
            maxLength={20}
            className="w-full bg-transparent border-b-2 border-outline-variant px-2 py-3 font-mono text-sm text-on-surface-variant focus:border-primary transition-colors outline-none"
            placeholder="978-987-..."
          />
        </div>

        {/* Edición digital */}
        <div className="flex items-center justify-between p-5 bg-surface rounded-lg">
          <div>
            <p className={labelClass + ' mb-0.5'}>Versión Digital Disponible</p>
            <p className="text-xs text-on-surface-variant">Muestra al comprador la opción de elegir entre físico y digital</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
            <input
              type="checkbox"
              name="tieneDigital"
              checked={form.tieneDigital}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6" />
          </label>
        </div>

        {/* Archivo digital — solo si tieneDigital */}
        {form.tieneDigital && (
          <div className="p-5 bg-surface rounded-lg space-y-3">
            <FileUploadField
              label="Archivo digital (PDF o ePub)"
              accept=".pdf,.epub"
              type="digital"
              value={form.archivoDigital}
              onChange={(url) => { setForm((f) => ({ ...f, archivoDigital: url })); onFormChange?.(); }}
              hint="El comprador recibirá este archivo post-pago — máx. 50 MB"
            />
            {form.archivoDigital && (
              <div className="flex items-center gap-2 text-xs text-tertiary">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Archivo listo para entrega digital
              </div>
            )}
          </div>
        )}

        {error && <p className="text-error text-sm">{error}</p>}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-8 py-3 text-sm font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors text-center"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-10 py-4 bg-primary text-on-primary rounded-full font-bold uppercase tracking-widest text-xs shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {book ? 'Actualizar Cambios' : 'Guardar Libro'}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}
