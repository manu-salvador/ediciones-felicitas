import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await adminLogin(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Acceso denegado. Verificá tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirige al endpoint del backend que inicia el flow de OAuth
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/admin/auth/google`;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
      <div style={{ background: '#fff', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: '2rem', marginBottom: '0.5rem', color: '#1e1b30', textAlign: 'center' }}>
          Panel de Administración
        </h1>
        <p style={{ color: '#6e6884', textAlign: 'center', marginBottom: '2rem', fontSize: '0.875rem' }}>
          Ediciones Felicitas
        </p>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#383450' }}>Email Autorizado</label>
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

          <Button type="submit" fullWidth size="lg" isLoading={loading}>
            Ingresar al Panel
          </Button>
        </form>

        <div style={{ position: 'relative', textAlign: 'center', margin: '2rem 0' }}>
          <hr style={{ border: 'none', borderTop: '1px solid #e4e2ec' }} />
          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '0 1rem', fontSize: '0.875rem', color: '#8a85a0' }}>
            o
          </span>
        </div>

        <Button variant="secondary" fullWidth onClick={handleGoogleLogin}>
          Acceder con Google Workspace
        </Button>
      </div>
    </div>
  );
};

export default AdminLogin;
