import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useUser } from '../context/UserContext';

const inputClass = 'w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';
const labelClass = 'block text-[0.625rem] font-bold uppercase tracking-widest text-outline mb-2';

function ProfileSection({ user, onSave }) {
  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await onSave(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <input
            type="tel"
            value={form.telefono}
            onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
            className={inputClass}
            placeholder="+54 11 ..."
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={inputClass}
          required
        />
      </div>

      {error && <p className="text-error text-sm">{error}</p>}
      {success && <p className="text-sm text-tertiary font-medium">Cambios guardados correctamente.</p>}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}

function AddressSection({ user, onSave }) {
  const [form, setForm] = useState({ direccion: user?.direccion || '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await onSave(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la dirección');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Dirección de envío</label>
        <textarea
          value={form.direccion}
          onChange={(e) => setForm({ direccion: e.target.value })}
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder="Calle, número, piso/depto — Ciudad, Provincia"
        />
        <p className="text-xs text-on-surface-variant mt-2">
          Esta dirección se usará como predeterminada al finalizar una compra.
        </p>
      </div>

      {error && <p className="text-error text-sm">{error}</p>}
      {success && <p className="text-sm text-tertiary font-medium">Dirección guardada correctamente.</p>}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar dirección'}
        </button>
      </div>
    </form>
  );
}

const TABS = ['Mis pedidos', 'Mi perfil', 'Dirección'];

export default function AccountPage() {
  const { user, logout, updateProfile } = useUser();
  const [tab, setTab] = useState('Mis pedidos');

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-8 py-16 pt-28">
        <header className="mb-10">
          <p className="text-tertiary font-bold tracking-widest uppercase text-xs mb-1">Mi cuenta</p>
          <h1 className="text-4xl font-headline text-on-surface tracking-tight">
            Hola, {user?.nombre}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">{user?.email}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <nav className="space-y-1">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors text-left font-medium
                    ${tab === t ? 'bg-primary-container text-primary' : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'}`}
                >
                  {t === 'Mis pedidos' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  )}
                  {t === 'Mi perfil' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  )}
                  {t === 'Dirección' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  )}
                  {t}
                </button>
              ))}
              <div className="pt-2">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  Catálogo
                </Link>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-low hover:text-error transition-colors text-sm text-left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Cerrar sesión
                </button>
              </div>
            </nav>
          </aside>

          {/* Content */}
          <section className="lg:col-span-9">
            <div className="bg-surface-low rounded-xl p-8">
              {tab === 'Mis pedidos' && (
                <>
                  <h2 className="text-xl font-headline text-on-surface mb-6">Historial de pedidos</h2>
                  <div className="text-center py-16">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-outline-variant mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                    <p className="text-on-surface-variant font-medium mb-1">Todavía no realizaste ningún pedido</p>
                    <p className="text-on-surface-variant/60 text-sm mb-6">Cuando completes una compra, aparecerá aquí con su estado.</p>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all"
                    >
                      Explorar el catálogo
                    </Link>
                  </div>
                </>
              )}

              {tab === 'Mi perfil' && (
                <>
                  <h2 className="text-xl font-headline text-on-surface mb-6">Datos personales</h2>
                  <ProfileSection user={user} onSave={updateProfile} />
                </>
              )}

              {tab === 'Dirección' && (
                <>
                  <h2 className="text-xl font-headline text-on-surface mb-2">Dirección de envío</h2>
                  {!user?.direccion && (
                    <div className="flex items-start gap-3 bg-primary-container/40 text-primary rounded-lg p-4 mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <p className="text-sm">No tenés ninguna dirección guardada. Te la pediremos antes de confirmar tu próxima compra.</p>
                    </div>
                  )}
                  <AddressSection user={user} onSave={updateProfile} />
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-outline-variant/30 py-12 mt-8">
        <div className="max-w-screen-xl mx-auto px-8 text-center text-on-surface-variant text-sm">
          <img src="/logo-ef.png" alt="Ediciones Felicitas" className="h-20 mx-auto mb-4 opacity-80" />
          <p>&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
