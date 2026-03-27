import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Páginas públicas
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import DetalleLibro from './pages/DetalleLibro';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import CheckoutResultado from './pages/CheckoutResultado';
import DescargarDigital from './pages/DescargarDigital';
import Login from './pages/Login';
import Registro from './pages/Registro';
import MiCuenta from './pages/MiCuenta';

// Páginas admin
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Libros from './pages/admin/Libros';
import LibroForm from './pages/admin/LibroForm';
import Pedidos from './pages/admin/Pedidos';
import DetallePedido from './pages/admin/DetallePedido';
import Categorias from './pages/admin/Categorias';

// Guards
import AdminRoute from './components/AdminRoute';

const App: React.FC = () => {
  return (
    <Routes>
      {/* ── Públicas ── */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/libro/:slug" element={<DetalleLibro />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/resultado" element={<CheckoutResultado />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/mi-cuenta" element={<MiCuenta />} />
      </Route>

      {/* ── Descarga digital (sin layout general) ── */}
      <Route path="/download/:token" element={<DescargarDigital />} />

      {/* ── Admin ── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/libros" element={<Libros />} />
          <Route path="/admin/libros/nuevo" element={<LibroForm />} />
          <Route path="/admin/libros/:id/editar" element={<LibroForm />} />
          <Route path="/admin/pedidos" element={<Pedidos />} />
          <Route path="/admin/pedidos/:id" element={<DetallePedido />} />
          <Route path="/admin/categorias" element={<Categorias />} />
        </Route>
      </Route>

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
