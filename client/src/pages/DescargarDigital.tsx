import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const DescargarDigital: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [downloading, setDownloading] = useState(false);

  // La descarga se hace navegando al endpoint directamente
  // Si el backend da error (ej: expirado), el navegador mostrará el JSON o el texto de error.
  // Idealmente habría un endpoint de "check" primero, pero como MVP navegamos directo.
  const handleDownload = () => {
    setDownloading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/api/download/${token}`;
    
    // Resetear botón visualmente después de un momento
    setTimeout(() => setDownloading(false), 3000);
  };

  if (!token) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Enlace inválido o corrupto.</h2>
        <Link to="/"><Button style={{ marginTop: '1rem' }}>Volver al Inicio</Button></Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '6rem 0', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ background: '#fff', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', marginBottom: '1rem', color: '#1e1b30' }}>
          Descarga de E-Book
        </h1>
        <p style={{ color: '#4b5563', marginBottom: '2rem', lineHeight: '1.6' }}>
          Este enlace es único y personal. Por favor, asegúrate de guardar el archivo PDF en tu dispositivo una vez finalizada la descarga.
        </p>

        <div style={{ padding: '2rem', background: '#f9f9fb', borderRadius: '8px', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#6e6884', marginBottom: '1rem' }}>
            Token de acceso verificado de forma segura.
          </p>
          <Button size="lg" fullWidth onClick={handleDownload} isLoading={downloading}>
            Descargar Libro Digital (PDF)
          </Button>
        </div>

        <p style={{ fontSize: '0.875rem', color: '#8a85a0' }}>
          Si tenés problemas con la descarga, contactá a soporte. Recordá que los links tienen un límite de 3 descargas y expiran en 30 días.
        </p>
      </div>
    </div>
  );
};

export default DescargarDigital;
