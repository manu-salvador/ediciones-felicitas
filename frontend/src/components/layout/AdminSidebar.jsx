import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const navItems = [
  {
    to: '/admin',
    end: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    label: 'Inventario',
  },
  {
    to: '/admin/ordenes',
    end: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    label: 'Órdenes',
  },
  {
    to: '/admin/publicaciones',
    end: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    label: 'Publicaciones',
  },
];

// open y onClose vienen de AdminLayout
// En desktop (lg+) el sidebar siempre está visible via CSS; open solo afecta mobile
export default function AdminSidebar({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // Lock body scroll when sidebar is open on mobile (only <lg breakpoint)
  useEffect(() => {
    const isLargeScreen = window.matchMedia('(min-width: 1024px)').matches;

    if (open && !isLargeScreen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavClick = () => {
    // Cierra el drawer al navegar en mobile
    onClose?.();
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.next !== pwForm.confirm) { setPwError('Las contraseñas no coinciden'); return; }
    if (pwForm.next.length < 6) { setPwError('Mínimo 6 caracteres'); return; }
    setPwLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwSuccess(true);
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => { setPwSuccess(false); setShowPwModal(false); }, 2000);
    } catch (err) {
      setPwError(err.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setPwLoading(false);
    }
  };

  const activeClass =
    'flex items-center gap-3 bg-primary/10 text-primary rounded-r-full p-3 font-bold translate-x-1';
  const inactiveClass =
    'flex items-center gap-3 text-on-surface-variant p-3 hover:bg-surface-high rounded-r-full hover:translate-x-1 transition-transform duration-200';

  return (
    <>
      <aside
        className={`
          h-screen w-64 fixed left-0 top-0
          bg-surface flex flex-col py-8 pr-4
          border-r border-outline-variant/20
          transition-transform duration-300 ease-in-out
          z-50 overflow-y-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Botón cerrar — solo en mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-1.5 rounded-full hover:bg-surface-low text-on-surface-variant transition-colors"
          aria-label="Cerrar menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Logo */}
        <div className="px-6 mb-10 flex flex-col items-start gap-2">
          <img src="/logo-ef.png" alt="Ediciones Felicitas" className="h-14" />
          <span className="text-[0.625rem] font-bold uppercase tracking-widest text-outline">Panel Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={handleNavClick}
              className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
            >
              {item.icon}
              <span className="text-xs uppercase tracking-widest font-medium">{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setShowPwModal(true)}
            className="w-full flex items-center gap-3 text-on-surface-variant p-3 hover:bg-surface-high rounded-r-full hover:translate-x-1 transition-transform duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span className="text-xs uppercase tracking-widest font-medium">Contraseña</span>
          </button>
        </nav>

        {/* Bottom */}
        <div className="px-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-on-surface-variant p-3 hover:bg-surface-high rounded-r-full hover:translate-x-1 transition-transform duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="text-xs uppercase tracking-widest font-medium">Salir</span>
          </button>
        </div>
      </aside>

      {/* Password change modal — fuera del aside para evitar z-index issues */}
      {showPwModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-xs p-6">
            <h3 className="font-headline font-bold text-on-surface mb-4">Cambiar contraseña</h3>
            {pwSuccess ? (
              <p className="text-green-600 text-sm font-medium text-center py-4">¡Contraseña actualizada!</p>
            ) : (
              <form onSubmit={handlePwSubmit} className="space-y-3">
                <input type="password" placeholder="Contraseña actual" value={pwForm.current} onChange={(e) => setPwForm(f => ({...f, current: e.target.value}))} className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
                <input type="password" placeholder="Nueva contraseña" value={pwForm.next} onChange={(e) => setPwForm(f => ({...f, next: e.target.value}))} className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" minLength={6} required />
                <input type="password" placeholder="Confirmar nueva contraseña" value={pwForm.confirm} onChange={(e) => setPwForm(f => ({...f, confirm: e.target.value}))} className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
                {pwError && <p className="text-error text-xs">{pwError}</p>}
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={pwLoading} className="flex-1 bg-primary text-on-primary py-2 rounded-full text-xs font-bold disabled:opacity-50">{pwLoading ? 'Guardando…' : 'Guardar'}</button>
                  <button type="button" onClick={() => { setShowPwModal(false); setPwError(''); setPwForm({ current: '', next: '', confirm: '' }); }} className="flex-1 border border-outline-variant text-on-surface-variant py-2 rounded-full text-xs font-bold">Cancelar</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
