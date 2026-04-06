import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useUser } from '../context/UserContext';
import { makeSanitizedHandler, sanitize } from '../utils/sanitize';

const inputClass = 'w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';
const labelClass = 'block text-[0.625rem] font-bold uppercase tracking-widest text-outline mb-2';

function ProfileSection({ user, onSave }) {
  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
  });
  const handleChange = makeSanitizedHandler(setForm);
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
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className={inputClass}
            maxLength={80}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <input
            type="tel"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            className={inputClass}
            maxLength={20}
            placeholder="+54 11 ..."
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className={inputClass}
          maxLength={100}
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
  const handleChange = (e) => setForm({ direccion: sanitize(e.target.value) });
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
          onChange={handleChange}
          rows={3}
          maxLength={200}
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

function SecuritySection({ onChangePassword, onDeleteAccount }) {
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  const [deletePass, setDeletePass] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [delError, setDelError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) return setPwError('Las contraseñas nuevas no coinciden');
    if (pwForm.next.length < 6) return setPwError('La nueva contraseña debe tener al menos 6 caracteres');
    setPwSaving(true); setPwError(''); setPwSuccess(false);
    try {
      await onChangePassword(pwForm.current, pwForm.next);
      setPwSuccess(true);
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err.response?.data?.error || 'Error al cambiar la contraseña');
    } finally { setPwSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true); setDelError('');
    try {
      await onDeleteAccount(deletePass);
    } catch (err) {
      setDelError(err.response?.data?.error || 'Contraseña incorrecta');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Cambiar contraseña */}
      <form onSubmit={handleChangePassword} className="space-y-5">
        <h3 className="text-base font-bold text-on-surface">Cambiar contraseña</h3>
        <div>
          <label className={labelClass}>Contraseña actual</label>
          <input type="password" value={pwForm.current} onChange={(e) => setPwForm(f => ({ ...f, current: e.target.value }))} className={inputClass} maxLength={100} required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Nueva contraseña</label>
            <input type="password" value={pwForm.next} onChange={(e) => setPwForm(f => ({ ...f, next: e.target.value }))} className={inputClass} maxLength={100} minLength={6} required />
          </div>
          <div>
            <label className={labelClass}>Confirmar nueva</label>
            <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm(f => ({ ...f, confirm: e.target.value }))} className={inputClass} maxLength={100} required />
          </div>
        </div>
        {pwError && <p className="text-error text-sm">{pwError}</p>}
        {pwSuccess && <p className="text-sm text-tertiary font-medium">Contraseña actualizada correctamente.</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={pwSaving} className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all disabled:opacity-50">
            {pwSaving ? 'Guardando…' : 'Cambiar contraseña'}
          </button>
        </div>
      </form>

      <div className="border-t border-error/20 pt-8">
        <h3 className="text-base font-bold text-error mb-2">Zona de peligro</h3>
        <p className="text-sm text-on-surface-variant mb-5">Una vez eliminada tu cuenta no podrás recuperarla. Se borrarán todos tus datos.</p>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="px-6 py-3 border-2 border-error text-error rounded-full text-xs font-bold uppercase tracking-widest hover:bg-error hover:text-white transition-colors">
            Eliminar mi cuenta
          </button>
        ) : (
          <div className="space-y-4 bg-error/5 border border-error/20 rounded-xl p-6">
            <p className="text-sm font-medium text-on-surface">Ingresá tu contraseña para confirmar:</p>
            <input type="password" value={deletePass} onChange={(e) => setDeletePass(e.target.value)} className={inputClass} placeholder="Tu contraseña" maxLength={100} />
            {delError && <p className="text-error text-sm">{delError}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-6 py-3 text-sm font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting || !deletePass} className="px-6 py-3 bg-error text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-error/80 transition-colors disabled:opacity-50">
                {deleting ? 'Eliminando…' : 'Confirmar eliminación'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const TABS = ['Mis pedidos', 'Mi perfil', 'Dirección', 'Seguridad'];

export default function AccountPage() {
  const { user, logout, updateProfile, changePassword, deleteAccount } = useUser();
  const [tab, setTab] = useState('Mis pedidos');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-8 py-16 pt-36">
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
                  {t === 'Seguridad' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
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

              {tab === 'Seguridad' && (
                <>
                  <h2 className="text-xl font-headline text-on-surface mb-6">Seguridad</h2>
                  <SecuritySection
                    onChangePassword={changePassword}
                    onDeleteAccount={async (password) => {
                      await deleteAccount(password);
                      navigate('/');
                    }}
                  />
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
