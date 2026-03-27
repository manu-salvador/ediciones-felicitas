import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminLayout.scss';

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <Link to="/admin/dashboard" className="admin-layout__brand">
          <span className="admin-layout__brand-ef">EF</span>
          <span>Admin</span>
        </Link>

        <nav className="admin-layout__nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-layout__nav-item ${isActive ? 'active' : ''}`}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/admin/libros" className={({ isActive }) => `admin-layout__nav-item ${isActive ? 'active' : ''}`}>
            📚 Libros
          </NavLink>
          <NavLink to="/admin/pedidos" className={({ isActive }) => `admin-layout__nav-item ${isActive ? 'active' : ''}`}>
            📦 Pedidos
          </NavLink>
          <NavLink to="/admin/categorias" className={({ isActive }) => `admin-layout__nav-item ${isActive ? 'active' : ''}`}>
            🏷️ Categorías
          </NavLink>
        </nav>

        <div className="admin-layout__sidebar-footer">
          <Link to="/" className="admin-layout__nav-item" target="_blank">🌐 Ver tienda</Link>
          <button onClick={handleLogout} className="admin-layout__nav-item admin-layout__logout">
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="admin-layout__body">
        <main className="admin-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
