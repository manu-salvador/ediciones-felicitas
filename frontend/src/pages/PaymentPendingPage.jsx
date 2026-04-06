import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function PaymentPendingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-screen-md mx-auto px-8 py-16 pt-36 text-center">
        {/* Clock icon */}
        <div className="w-20 h-20 rounded-full bg-primary-container/30 flex items-center justify-center mx-auto mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>

        <h1 className="text-4xl font-headline font-bold text-on-surface mb-4">
          Pago en proceso
        </h1>
        <p className="text-on-surface-variant text-lg mb-8">
          Tu pago está siendo procesado. Te notificaremos cuando se confirme.
        </p>

        <div className="flex justify-center">
          <Link
            to="/cuenta"
            className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Ver mis pedidos
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
