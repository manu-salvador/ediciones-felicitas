import { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from '../components/layout/AdminLayout';
import Spinner from '../components/ui/Spinner';
import api from '../services/api';

const labelClass = 'block text-[0.625rem] font-bold uppercase tracking-widest text-outline mb-2';
const inputClass = 'w-full bg-surface-high border-none rounded-lg px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/30 transition-all outline-none text-sm';

// Toolbar de formato simple — inserta markdown en el textarea
function FormatToolbar({ textareaRef, setValue }) {
  const apply = (before, after = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const sel   = el.value.slice(start, end);
    const newVal = el.value.slice(0, start) + before + sel + after + el.value.slice(end);
    setValue(newVal);
    setTimeout(() => {
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd   = start + before.length + sel.length;
    }, 0);
  };

  const insertAtCursor = (text) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const newVal = el.value.slice(0, start) + text + el.value.slice(start);
    setValue(newVal);
    setTimeout(() => {
      el.focus();
      el.selectionStart = start + text.length;
      el.selectionEnd   = start + text.length;
    }, 0);
  };

  const btns = [
    { label: 'N', title: 'Negrita',          action: () => apply('**', '**'),    style: 'font-black' },
    { label: 'I', title: 'Cursiva',           action: () => apply('_', '_'),      style: 'italic' },
    { label: '—', title: 'Separador',         action: () => insertAtCursor('\n\n---\n\n'), style: '' },
    { label: '• Lista', title: 'Viñeta',      action: () => insertAtCursor('\n- '), style: '' },
    { label: '1. Lista', title: 'Numerada',   action: () => insertAtCursor('\n1. '), style: '' },
  ];

  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {btns.map((b) => (
        <button
          key={b.label}
          type="button"
          title={b.title}
          onClick={b.action}
          className={`px-3 py-1 text-xs border border-outline-variant rounded-md bg-surface hover:bg-surface-high text-on-surface-variant transition-colors ${b.style}`}
        >
          {b.label}
        </button>
      ))}
      <span className="text-[10px] text-outline self-center ml-2">Seleccioná texto → N / I</span>
    </div>
  );
}

function PublicacionForm({ pub, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ titulo: '', texto: '', foto: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    setForm(pub ? { titulo: pub.titulo || '', texto: pub.texto || '', foto: pub.foto || '' } : { titulo: '', texto: '', foto: '' });
    setError('');
  }, [pub]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/upload/publicaciones', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((f) => ({ ...f, foto: data.url }));
    } catch (e) {
      setUploadErr(e.response?.data?.error || 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) return setError('El título es obligatorio');
    if (!form.texto.trim())  return setError('El texto es obligatorio');
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-surface-low p-6 rounded-xl">
      <div>
        <label className={labelClass}>Título *</label>
        <input
          value={form.titulo}
          onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
          maxLength={200}
          className={inputClass}
          placeholder="Título de la publicación"
        />
      </div>

      <div>
        <label className={labelClass}>Texto *</label>
        <FormatToolbar
          textareaRef={textareaRef}
          setValue={(val) => setForm((f) => ({ ...f, texto: val }))}
        />
        <textarea
          ref={textareaRef}
          value={form.texto}
          onChange={(e) => setForm((f) => ({ ...f, texto: e.target.value }))}
          rows={12}
          className={`${inputClass} resize-y min-h-[200px] font-mono text-sm`}
          placeholder="Contenido de la publicación…&#10;&#10;Usá **negrita**, _cursiva_ o listas con la toolbar de arriba."
        />
        <p className="text-[10px] text-outline mt-1">Soporta formato Markdown: **negrita**, _cursiva_, - lista</p>
      </div>

      <div>
        <label className={labelClass}>Foto (opcional)</label>
        {form.foto && (
          <img src={form.foto} alt="Preview" className="w-full max-h-48 object-cover rounded-lg mb-3" />
        )}
        <label className="flex items-center gap-3 cursor-pointer">
          <span className={`px-4 py-2 rounded-lg border-2 border-dashed text-xs font-bold uppercase tracking-widest transition-colors ${uploading ? 'border-outline-variant text-outline' : 'border-primary/30 text-primary hover:border-primary hover:bg-primary/5'}`}>
            {uploading ? 'Subiendo…' : form.foto ? 'Cambiar foto' : 'Subir foto'}
          </span>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" disabled={uploading} />
        </label>
        {uploadErr && <p className="text-xs text-error mt-1">{uploadErr}</p>}
        {form.foto && (
          <button type="button" onClick={() => setForm((f) => ({ ...f, foto: '' }))} className="text-xs text-error/60 hover:text-error underline underline-offset-2 mt-2 transition-colors">
            Quitar foto
          </button>
        )}
      </div>

      {error && <p className="text-error text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold uppercase tracking-widest text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
        >
          {pub ? 'Guardar cambios' : 'Publicar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 text-sm font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function AdminPublicacionesPage() {
  const [pubs, setPubs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [editing, setEditing]   = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchPubs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/publicaciones?limit=50');
      setPubs(data.data);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPubs(); }, [fetchPubs]);

  const handleSubmit = async (form) => {
    setSaving(true);
    try {
      if (editing === 'new') {
        const { data } = await api.post('/publicaciones', form);
        setPubs((prev) => [data, ...prev]);
      } else {
        const { data } = await api.put(`/publicaciones/${editing.id}`, form);
        setPubs((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      }
      setEditing(null);
    } catch { /* silently fail */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/publicaciones/${id}`);
      setPubs((prev) => prev.filter((p) => p.id !== id));
    } catch { /* silently fail */ }
    finally { setDeleteId(null); }
  };

  return (
    <AdminLayout>
      {/* Header sticky-ish — siempre visible */}
      <header className="mb-6 lg:mb-10">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight text-on-surface">Publicaciones</h2>
            <p className="text-on-surface-variant mt-1 text-sm">Novedades y artículos del blog.</p>
          </div>
          {editing === null && (
            <button
              onClick={() => setEditing('new')}
              className="flex-shrink-0 px-6 py-3 bg-primary text-on-primary rounded-full font-bold uppercase tracking-widest text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              + Nueva
            </button>
          )}
        </div>
      </header>

      {editing !== null && (
        <div className="mb-8">
          <h3 className="text-lg font-headline font-bold text-on-surface mb-4">
            {editing === 'new' ? 'Nueva publicación' : 'Editar publicación'}
          </h3>
          <PublicacionForm
            pub={editing === 'new' ? null : editing}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
            loading={saving}
          />
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : pubs.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <p className="font-medium">No hay publicaciones todavía.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pubs.map((pub) => (
            <div key={pub.id} className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface">
              <div className="flex items-center gap-3 p-4">
                {/* Thumb */}
                {pub.foto ? (
                  <img src={pub.foto} alt={pub.titulo} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-surface-high flex-shrink-0" />
                )}
                {/* Info — min-w-0 para que el texto no rompa el layout */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-sm truncate">{pub.titulo}</p>
                  <p className="text-xs text-on-surface-variant">
                    {new Date(pub.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1 break-all">{pub.texto.replace(/\*\*|__|_|\*|^#+\s/gm, '')}</p>
                </div>
                {/* Acciones — siempre a la derecha, no se comprimen */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setEditing(pub); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-3 py-1.5 text-xs font-bold bg-surface-low text-on-surface-variant rounded-full hover:bg-surface-high transition-colors whitespace-nowrap"
                  >
                    Editar
                  </button>
                  {deleteId === pub.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(pub.id)} className="px-2 py-1.5 text-xs font-bold bg-error text-white rounded-full whitespace-nowrap">Sí, borrar</button>
                      <button onClick={() => setDeleteId(null)} className="px-2 py-1.5 text-xs font-bold border border-outline-variant rounded-full">No</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteId(pub.id)}
                      className="px-3 py-1.5 text-xs font-bold text-error/50 hover:text-error rounded-full transition-colors whitespace-nowrap"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
