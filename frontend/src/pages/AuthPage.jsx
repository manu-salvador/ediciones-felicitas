import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { makeSanitizedHandler } from '../utils/sanitize';

const inputClass = 'w-full border border-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';
const labelClass = 'block text-xs font-medium text-on-surface-variant mb-1 uppercase tracking-wider';

function LoginForm({ onSwitch }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const handleChange = makeSanitizedHandler(setForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          value={form.email}
          name="email"
          onChange={handleChange}
          className={inputClass}
          placeholder="tu@email.com"
          maxLength={100}
          required
        />
      </div>
      <div>
        <label className={labelClass}>Contraseña</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className={inputClass}
          placeholder="••••••••"
          maxLength={100}
          required
        />
      </div>

      {error && <p className="text-error text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-on-primary py-3 rounded-full font-bold hover:bg-secondary transition-colors disabled:opacity-50"
      >
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>

      <p className="text-center text-sm text-on-surface-variant">
        ¿No tenés cuenta?{' '}
        <button type="button" onClick={onSwitch} className="text-primary font-medium hover:underline">
          Registrate
        </button>
      </p>
    </form>
  );
}

function RegisterForm({ onSwitch }) {
  const [form, setForm] = useState({
    nombre: '', email: '',
    password: '', passwordConfirm: '',
    calle: '', numero: '', piso: '', ciudad: '',
  });
  const handleChange = makeSanitizedHandler(setForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.passwordConfirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await register(form.nombre, form.email, form.password, {
        calle: form.calle,
        numero: form.numero,
        piso: form.piso,
        ciudad: form.ciudad,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Datos personales */}
      <div>
        <label className={labelClass}>Nombre completo</label>
        <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
          className={inputClass} placeholder="Tu nombre completo" maxLength={80} required />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange}
          className={inputClass} placeholder="tu@email.com" maxLength={100} required />
      </div>

      {/* Dirección de envío */}
      <div>
        <p className={labelClass}>Dirección de envío</p>
        <div className="space-y-2">
          <input type="text" name="calle" value={form.calle} onChange={handleChange}
            className={inputClass} placeholder="Calle" maxLength={100} required />
          <div className="flex gap-2">
            <input type="text" name="numero" value={form.numero} onChange={handleChange}
              className={inputClass} placeholder="Número" maxLength={20} required />
            <input type="text" name="piso" value={form.piso} onChange={handleChange}
              className={inputClass} placeholder="Piso / Dto (opcional)" maxLength={20} />
          </div>
          <input type="text" name="ciudad" value={form.ciudad} onChange={handleChange}
            className={inputClass} placeholder="Ciudad" maxLength={80} required />
        </div>
      </div>

      {/* Contraseña */}
      <div>
        <label className={labelClass}>Contraseña</label>
        <input type="password" name="password" value={form.password} onChange={handleChange}
          className={inputClass} placeholder="Mínimo 6 caracteres" maxLength={100} minLength={6} required />
      </div>
      <div>
        <label className={labelClass}>Confirmar contraseña</label>
        <input type="password" name="passwordConfirm" value={form.passwordConfirm} onChange={handleChange}
          className={`${inputClass} ${form.passwordConfirm && form.password !== form.passwordConfirm ? 'border-error focus:border-error focus:ring-error/30' : ''}`}
          placeholder="Repetí tu contraseña" maxLength={100} required />
        {form.passwordConfirm && form.password !== form.passwordConfirm && (
          <p className="text-error text-xs mt-1">Las contraseñas no coinciden</p>
        )}
      </div>

      {error && <p className="text-error text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-on-primary py-3 rounded-full font-bold hover:bg-secondary transition-colors disabled:opacity-50"
      >
        {loading ? 'Creando cuenta…' : 'Crear Cuenta'}
      </button>

      <p className="text-center text-sm text-on-surface-variant">
        ¿Ya tenés cuenta?{' '}
        <button type="button" onClick={onSwitch} className="text-primary font-medium hover:underline">
          Iniciá sesión
        </button>
      </p>
    </form>
  );
}

export default function AuthPage() {
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.tab || 'login');

  return (
    <div className="min-h-screen bg-surface-low flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/logo-ef.png" alt="Ediciones Felicitas" className="h-24 mx-auto mb-6" />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex bg-surface-high rounded-full p-1 mb-6">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === 'login' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant'
            }`}
          >
            Ingresar
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === 'register' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant'
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant p-8">
          {tab === 'login'
            ? <LoginForm onSwitch={() => setTab('register')} />
            : <RegisterForm onSwitch={() => setTab('login')} />
          }
        </div>
      </div>
    </div>
  );
}
