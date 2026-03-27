import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/mi-cuenta');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verificá tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '6rem 0', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ background: '#fff', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '0.5rem', color: '#1e1b30', textAlign: 'center' }}>
          Ingresar
        </h1>
        <p style={{ color: '#6e6884', textAlign: 'center', marginBottom: '2rem' }}>
          Accedé a tu biblioteca digital y compras
        </p>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#383450' }}>Email</label>
            <input 
              type="email" 
              required 
              style={{ padding: '0.75rem 1rem', border: '1.5px solid #e4e2ec', borderRadius: '8px', width: '100%', outline: 'none' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#383450' }}>Contraseña</label>
            <input 
              type="password" 
              required 
              style={{ padding: '0.75rem 1rem', border: '1.5px solid #e4e2ec', borderRadius: '8px', width: '100%', outline: 'none' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" fullWidth size="lg" isLoading={loading} style={{ marginTop: '0.5rem' }}>
            Iniciar Sesión
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: '#6e6884' }}>
          ¿No tenés cuenta?{' '}
          <Link to="/registro" style={{ color: '#7f4ef0', fontWeight: 600, textDecoration: 'none' }}>
            Registrate acá
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
