import React, { useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './MainLayout.scss';

const MainLayout: React.FC = () => {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <div className="main-layout__nav">
          <Link to="/" className="main-layout__logo">
            <img src="/assets/logo.png" alt="Ediciones Felicitas" className="main-layout__logo-img" />
          </Link>

          {/* Links Desktop */}
          <nav className="main-layout__links">
            <NavLink to="/catalogo" className={({ isActive }) => isActive ? 'active' : ''}>
              Catálogo
            </NavLink>
          </nav>

          <div className="main-layout__actions">
            {user ? (
              <>
                <NavLink to="/mi-cuenta" className="main-layout__action-link">Mi cuenta</NavLink>
                <button onClick={logout} className="main-layout__action-link main-layout__action-link--btn">
                  Salir
                </button>
              </>
            ) : (
              <NavLink to="/login" className="main-layout__action-link">Ingresar</NavLink>
            )}
            <Link to="/carrito" className="main-layout__cart" aria-label="Carrito de compras">
              <span className="main-layout__cart-icon">🛒</span>
              {itemCount > 0 && <span className="main-layout__cart-badge">{itemCount}</span>}
            </Link>
            {/* Hamburguesa mobile */}
            <button
              className="main-layout__hamburger"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu overlay */}
      {menuOpen && (
        <div className="main-layout__mobile-menu" onClick={closeMenu}>
          <div className="main-layout__mobile-menu-panel" onClick={e => e.stopPropagation()}>
            <button
              onClick={closeMenu}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', alignSelf: 'flex-end' }}
              aria-label="Cerrar menú"
            >✕</button>
            <Link to="/catalogo" onClick={closeMenu}>Catálogo</Link>
            <Link to="/carrito" onClick={closeMenu}>Carrito {itemCount > 0 && `(${itemCount})`}</Link>
            {user ? (
              <>
                <Link to="/mi-cuenta" onClick={closeMenu}>Mi cuenta</Link>
                <button onClick={() => { logout(); closeMenu(); }} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1.125rem', color: '#dc2626', padding: '0.5rem 0' }}>Salir</button>
              </>
            ) : (
              <Link to="/login" onClick={closeMenu}>Ingresar</Link>
            )}
          </div>
        </div>
      )}

      <main className="main-layout__main">
        <Outlet />
      </main>

      <footer className="main-layout__footer">
        <div className="main-layout__footer-inner">
          <div>
            <p className="main-layout__footer-brand">Ediciones Felicitas</p>
            <p className="main-layout__footer-sub">Editorial de Ana María Cabrera</p>
          </div>
          <p className="main-layout__footer-copy">© {new Date().getFullYear()} Ediciones Felicitas. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
