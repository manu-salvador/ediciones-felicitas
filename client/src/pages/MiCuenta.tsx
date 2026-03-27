import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import './MiCuenta.scss';

const MiCuenta: React.FC = () => {
  const { user, logout, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateUser(formData);
      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="perfil container">
      <div className="perfil__header">
        <h1 className="perfil__title">Mi Cuenta</h1>
        <Button variant="ghost" onClick={logout}>Cerrar Sesión</Button>
      </div>

      <div className="perfil__grid">
        <div className="perfil__card">
          <div className="perfil__card-header">
            <h2>Datos Personales</h2>
            {!isEditing && (
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                Editar
              </Button>
            )}
          </div>

          {error && <div className="perfil__alert perfil__alert--error">{error}</div>}
          {success && <div className="perfil__alert perfil__alert--success">{success}</div>}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="perfil__form fade-in">
              <div className="form-group row">
                <div className="form-item">
                  <label htmlFor="firstName">Nombre</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-item">
                  <label htmlFor="lastName">Apellido</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group row">
                <div className="form-item">
                  <label htmlFor="phone">Teléfono</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-item">
                  <label htmlFor="address">Dirección</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="perfil__form-actions">
                <Button type="button" variant="ghost" onClick={() => {
                  setIsEditing(false);
                  setError('');
                  // Restaurar datos originales
                  setFormData({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone || '',
                    address: user.address || '',
                  });
                }} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={loading}>
                  Guardar Cambios
                </Button>
              </div>
            </form>
          ) : (
            <div className="perfil__data fade-in">
              <div className="perfil__data-item">
                <span className="label">Nombre completo</span>
                <span className="value">{user.firstName} {user.lastName}</span>
              </div>
              <div className="perfil__data-item">
                <span className="label">Email</span>
                <span className="value">{user.email}</span>
              </div>
              <div className="perfil__data-item">
                <span className="label">Teléfono</span>
                <span className="value">{user.phone || <em className="text-muted">No especificado</em>}</span>
              </div>
              <div className="perfil__data-item">
                <span className="label">Dirección</span>
                <span className="value">{user.address || <em className="text-muted">No especificada</em>}</span>
              </div>
            </div>
          )}
        </div>

        <div className="perfil__card">
          <div className="perfil__card-header">
            <h2>Mis Compras</h2>
          </div>
          <div className="perfil__empty-state">
            <p>El historial de pedidos estará disponible próximamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiCuenta;
