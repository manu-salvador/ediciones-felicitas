import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import api from '../api/axios';

const Registro: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // 1. Registrar
      await api.post('/api/auth/register', formData);
      // 2. Auto-login inmediato
      await login(formData.email, formData.password);
      navigate('/mi-cuenta');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '6rem 0', maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ background: '#fff', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '0.5rem', color: '#1e1b30', textAlign: 'center' }}>
          Registro
        </h1>
        <p style={{ color: '#6e6884', textAlign: 'center', marginBottom: '2rem' }}>
          Creá tu cuenta para gestionar tus compras
        </p>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#383450' }}>Nombre</label>
              <input type="text" name="firstName" required onChange={handleInputChange} style={{ padding: '0.75rem 1rem', border: '1.5px solid #e4e2ec', borderRadius: '8px', width: '100%', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#383450' }}>Apellido</label>
              <input type="text" name="lastName" required onChange={handleInputChange} style={{ padding: '0.75rem 1rem', border: '1.5px solid #e4e2ec', borderRadius: '8px', width: '100%', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#383450' }}>Email</label>
            <input type="email" name="email" required onChange={handleInputChange} style={{ padding: '0.75rem 1rem', border: '1.5px solid #e4e2ec', borderRadius: '8px', width: '100%', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#383450' }}>Teléfono</label>
            <input type="tel" name="phone" required onChange={handleInputChange} style={{ padding: '0.75rem 1rem', border: '1.5px solid #e4e2ec', borderRadius: '8px', width: '100%', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#383450' }}>Contraseña</label>
            <input type="password" name="password" required minLength={6} onChange={handleInputChange} style={{ padding: '0.75rem 1rem', border: '1.5px solid #e4e2ec', borderRadius: '8px', width: '100%', outline: 'none' }} />
          </div>

          <Button type="submit" fullWidth size="lg" isLoading={loading} style={{ marginTop: '0.5rem' }}>
            Crear Cuenta
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: '#6e6884' }}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" style={{ color: '#7f4ef0', fontWeight: 600, textDecoration: 'none' }}>
            Ingresá acá
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Registro;
