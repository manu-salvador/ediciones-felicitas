import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/Button';

const CheckoutResultado: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const payment_id = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const external_reference = searchParams.get('external_reference');

  const isSuccess = status === 'approved';
  // const isPending = status === 'pending' || status === 'in_process';
  // const isRejected = status === 'rejected';

  useEffect(() => {
    // Si viene de MP y fue exitoso, limpiamos el carrito por seguridad (aunque idealmente se hace en el server/webhook o en onPaymentSubmit de bricks)
    if (isSuccess) {
      clearCart();
    }
  }, [isSuccess, clearCart]);

  if (!payment_id) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>No hay datos de pago activos.</h2>
        <Link to="/"><Button style={{ marginTop: '1rem' }}>Volver al Inicio</Button></Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ background: '#fff', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        
        {isSuccess ? (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#16a34a' }}>¡Pago Exitoso!</h1>
            <p style={{ color: '#4b5563', marginBottom: '2rem', lineHeight: '1.6' }}>
              Tu pago (Nro: {payment_id}) ha sido procesado correctamente. 
              El Nro de pedido es <strong>{external_reference}</strong>.
            </p>
            <p style={{ color: '#4b5563', marginBottom: '2rem', lineHeight: '1.6' }}>
              Pronto recibirás un email con los detalles de tu compra. 
              Si compraste libros digitales (E-books), el enlace de descarga vendrá en ese mismo correo.
            </p>
            <Link to="/"><Button fullWidth>Volver al Inicio</Button></Link>
          </>
        ) : (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#dc2626' }}>Problema con el pago</h1>
            <p style={{ color: '#4b5563', marginBottom: '2rem', lineHeight: '1.6' }}>
              Tu pago se encuentra en estado: <strong>{status}</strong>.
            </p>
            <p style={{ color: '#4b5563', marginBottom: '2rem', lineHeight: '1.6' }}>
              Por favor, intenta nuevamente desde tu carrito o contactate con soporte si crees que es un error.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button variant="secondary" fullWidth onClick={() => navigate('/carrito')}>Volver al Carrito</Button>
              <Link style={{ width: '100%' }} to="/"><Button fullWidth>Inicio</Button></Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default CheckoutResultado;
