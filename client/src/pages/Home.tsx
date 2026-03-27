import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const Home: React.FC = () => {
  return (
    <div style={{ padding: '4rem 1rem', textAlign: 'center', minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', color: '#1e1b30' }}>
        Bienvenidos a Ediciones Felicitas
      </h1>
      
      <p style={{ fontSize: '1.25rem', color: '#524d65', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
        Historias reales con mirada de autor. Descubrí nuestro catálogo exclusivo y sumergite en relatos que transcienden el tiempo.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/catalogo">
          <Button variant="primary">Explorar el Catálogo</Button>
        </Link>
        <Link to="/mi-cuenta">
          <Button variant="secondary">Mi Biblioteca</Button>
        </Link>
      </div>
      
      <div style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1000px', width: '100%' }}>
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontFamily: 'Roboto, sans-serif' }}>Catálogo Exclusivo</h3>
          <p style={{ color: '#6e6884', fontSize: '0.875rem' }}>Explorá nuestras obras físicas con envíos a todo el país.</p>
        </div>
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontFamily: 'Roboto, sans-serif' }}>Lectura Inmediata</h3>
          <p style={{ color: '#6e6884', fontSize: '0.875rem' }}>E-books disponibles instantáneamente para todas tus pantallas.</p>
        </div>
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontFamily: 'Roboto, sans-serif' }}>Comunidad de Lectores</h3>
          <p style={{ color: '#6e6884', fontSize: '0.875rem' }}>Formá parte de nuestro universo de colecciones limitadas.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
