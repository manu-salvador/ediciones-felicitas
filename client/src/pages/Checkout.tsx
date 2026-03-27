import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { Button } from '../components/ui/Button';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { createInputHandler, INPUT_LIMITS } from '../utils/inputValidation';
import './Checkout.scss';

// Inicializar MP
if (import.meta.env.VITE_MP_PUBLIC_KEY) {
  initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'es-AR' });
}

const Checkout: React.FC = () => {
  const { items, total, hasPhysicalItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingCost] = useState(0); // ⚠️ TBD: Cálculo de envío real para físicos
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    street: '',
    number: '',
    city: '',
    state: '',
    zip: '',
    requestInvoice: false,
    cuit: '',
    businessName: '',
  });

  // Calcular totales
  const totalConEnvio = total + shippingCost;

  useEffect(() => {
    if (items.length === 0) {
      navigate('/carrito');
    }
  }, [items, navigate]);

  const handleInputChange = createInputHandler(setFormData);

  const handleCreateOrderAndPreference = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Preparar payload de la orden
      const payload = {
        guestData: !user ? {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        } : undefined,
        shippingAddress: hasPhysicalItems ? {
          street: formData.street,
          number: formData.number,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        } : null,
        shippingCost,
        items: items.map(item => ({
          bookId: item.bookId,
          type: item.type,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        invoiceRequested: formData.requestInvoice,
        invoiceData: formData.requestInvoice ? {
          cuit: formData.cuit,
          businessName: formData.businessName,
        } : null,
      };

      // 2. Llamar API para crear orden y preferencia
      const { data } = await api.post('/api/orders', payload);
      
      // La API nos devuelve la preferenceId
      setPreferenceId(data.data.mpPreferenceId);
      
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al procesar la orden. Verificá tus datos o disponibilidad.');
    } finally {
      setLoading(false);
    }
  };

  // Callbacks de MP Payment Brick
  const onPaymentReady = async () => {
    console.log('Payment Brick ready');
  };

  const onPaymentError = async (error: any) => {
    console.error('Payment Brick error', error);
  };

  const onPaymentSubmit = async () => {
    // Cuando el pago en MP finaliza, podemos limpiar el carrito
    clearCart();
    // La redirección real la hace MP hacia /checkout/resultado según el preference, o lo capturamos acá.
  };

  if (items.length === 0) return null;

  return (
    <div className="checkout container py-12">
      <h1 className="checkout__title">Finalizar Compra</h1>

      <div className="checkout__layout">
        <div className="checkout__main">
          {error && <div className="checkout__error">{error}</div>}

          {!preferenceId ? (
            <form className="checkout__form" onSubmit={handleCreateOrderAndPreference}>
              
              {/* Datos de contacto */}
              <section className="checkout__section">
                <h2 className="checkout__section-title">Datos de Contacto</h2>
                <div className="checkout__grid">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required maxLength={INPUT_LIMITS.name} autoComplete="given-name" />
                  </div>
                  <div className="form-group">
                    <label>Apellido</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required maxLength={INPUT_LIMITS.name} autoComplete="family-name" />
                  </div>
                  <div className="form-group">
                    <label>Email (Acá enviaremos los links de descarga o recibos)</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required maxLength={INPUT_LIMITS.email} autoComplete="email" />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required maxLength={INPUT_LIMITS.phone} autoComplete="tel" placeholder="+54 9 11 1234-5678" />
                  </div>
                </div>
              </section>

              {/* Datos de envío (solo si hay físicos) */}
              {hasPhysicalItems && (
                <section className="checkout__section">
                  <h2 className="checkout__section-title">Datos de Envío</h2>
                  <div className="checkout__grid">
                    <div className="form-group">
                      <label>Calle</label>
                      <input type="text" name="street" value={formData.street} onChange={handleInputChange} required maxLength={INPUT_LIMITS.street} autoComplete="street-address" />
                    </div>
                    <div className="form-group">
                      <label>Número</label>
                      <input type="text" name="number" inputMode="numeric" value={formData.number} onChange={handleInputChange} required maxLength={INPUT_LIMITS.streetNumber} />
                    </div>
                    <div className="form-group">
                      <label>Ciudad</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} required maxLength={INPUT_LIMITS.city} autoComplete="address-level2" />
                    </div>
                    <div className="form-group">
                      <label>Provincia</label>
                      <input type="text" name="state" value={formData.state} onChange={handleInputChange} required maxLength={INPUT_LIMITS.province} autoComplete="address-level1" />
                    </div>
                    <div className="form-group">
                      <label>Código Postal</label>
                      <input type="text" name="zip" inputMode="numeric" value={formData.zip} onChange={handleInputChange} required maxLength={INPUT_LIMITS.zip} autoComplete="postal-code" placeholder="Ej: 1234" />
                    </div>
                  </div>
                </section>
              )}

              {/* Facturación */}
              <section className="checkout__section">
                <h2 className="checkout__section-title">Facturación</h2>
                <div className="form-checkbox">
                  <input type="checkbox" id="requestInvoice" name="requestInvoice" checked={formData.requestInvoice} onChange={handleInputChange} />
                  <label htmlFor="requestInvoice">Solicito Factura A/C con datos impositivos</label>
                </div>
                
                {formData.requestInvoice && (
                  <div className="checkout__grid mt-4">
                    <div className="form-group">
                      <label>CUIT</label>
                      <input type="text" name="cuit" value={formData.cuit} onChange={handleInputChange} required maxLength={INPUT_LIMITS.cuit} inputMode="numeric" placeholder="Ej: 20-12345678-9" />
                    </div>
                    <div className="form-group">
                      <label>Razón Social</label>
                      <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} required maxLength={INPUT_LIMITS.businessName} />
                    </div>
                  </div>
                )}
              </section>

              <Button type="submit" size="lg" isLoading={loading} fullWidth>
                Continuar al Pago ${totalConEnvio.toLocaleString('es-AR')}
              </Button>
            </form>
          ) : (
            <div className="checkout__payment-brick">
              <h2 className="checkout__section-title">Completar Pago Seguro</h2>
              <Payment
                initialization={{ preferenceId, amount: totalConEnvio }}
                onSubmit={onPaymentSubmit}
                onReady={onPaymentReady}
                onError={onPaymentError}
                customization={{
                  visual: { style: { theme: 'default' } },
                  paymentMethods: {
                    ticket: 'all',
                    bankTransfer: 'all',
                    creditCard: 'all',
                    debitCard: 'all',
                    mercadoPago: 'all',
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Resumen Sidebar */}
        <aside className="checkout__sidebar">
          <div className="checkout__summary">
            <h3 className="checkout__summary-title">Resumen de tu pedido</h3>
            
            <ul className="checkout__items-list">
              {items.map(item => (
                <li key={`${item.bookId}-${item.type}`} className="checkout__item-row">
                  <span className="name">{item.title} <small>({item.type === 'physical' ? 'Físico' : 'Digital'} x{item.quantity})</small></span>
                  <span className="price">${(item.unitPrice * item.quantity).toLocaleString('es-AR')}</span>
                </li>
              ))}
            </ul>

            <div className="checkout__totals">
              <div className="row">
                <span>Subtotal</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
              {hasPhysicalItems && (
                <div className="row">
                  <span>Envío estimado</span>
                  <span>${shippingCost === 0 ? 'Gratis' : shippingCost.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="row row--total">
                <span>Total a Pagar</span>
                <span>${totalConEnvio.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
