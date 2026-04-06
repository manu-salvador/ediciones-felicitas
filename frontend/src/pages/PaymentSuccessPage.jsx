import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useCart } from '../context/CartContext';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  useEffect(() => { clearCart(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-screen-md mx-auto px-8 py-16 pt-36 text-center">
        {/* Checkmark icon */}
        <div className="w-20 h-20 rounded-full bg-tertiary/10 flex items-center justify-center mx-auto mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 className="text-4xl font-headline font-bold text-on-surface mb-4">
          ¡Pago exitoso!
        </h1>
        <p className="text-on-surface-variant text-lg mb-4">
          Tu pedido fue confirmado. Recibirás un email con los detalles.
        </p>

        {externalReference && (
          <p className="text-sm text-on-surface-variant/70 mb-2">
            Referencia: <span className="font-mono font-medium">{externalReference}</span>
          </p>
        )}
        {paymentId && (
          <p className="text-sm text-on-surface-variant/70 mb-8">
            ID de pago: <span className="font-mono font-medium">{paymentId}</span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            to="/cuenta"
            className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Ver mis pedidos
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 border border-outline-variant text-on-surface-variant px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-surface-low transition-colors"
          >
            Seguir comprando
          </Link>
        </div>
      </main>

      <footer className="border-t border-outline-variant/30 py-12 mt-8">
        <div className="max-w-screen-xl mx-auto px-8 text-center text-on-surface-variant text-sm">
          <img src="/logo-ef.png" alt="Ediciones Felicitas" className="h-20 mx-auto mb-4 opacity-80" />
          <p>&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
