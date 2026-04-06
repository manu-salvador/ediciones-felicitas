import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-screen-md mx-auto px-8 py-16 pt-36 text-center">
        {/* X icon */}
        <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>

        <h1 className="text-4xl font-headline font-bold text-on-surface mb-4">
          El pago no se completó
        </h1>
        <p className="text-on-surface-variant text-lg mb-8">
          Hubo un problema con tu pago. Tu carrito se conservó.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/carrito"
            className="inline-flex items-center justify-center gap-2 border border-outline-variant text-on-surface-variant px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-surface-low transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Volver al carrito
          </Link>
          <Link
            to="/carrito"
            className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
          >
            Intentar de nuevo
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
