import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const { isLoggedIn, user, logout } = useUser();

  return (
    <header className="fixed top-0 z-50 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
      <nav className="flex justify-between items-center w-full px-8 py-4 max-w-screen-xl mx-auto">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo-ef.png" alt="Ediciones Felicitas" className="h-20" />
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/publicaciones" className="hidden sm:block text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
            Publicaciones
          </Link>
          {/* Cart */}
          <Link to="/carrito" className="text-on-surface-variant hover:text-primary transition-colors relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-on-primary text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          {/* User */}
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              {/* Nombre visible en md+, ícono de perfil en mobile */}
              <Link
                to="/cuenta"
                className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="hidden md:block">{user?.nombre}</span>
              </Link>
              <button
                onClick={logout}
                className="text-on-surface-variant hover:text-error transition-colors text-xs font-medium uppercase tracking-wider"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-on-surface-variant hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
