import { useState } from 'react';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex">

      {/* Overlay mobile — toca fuera del sidebar para cerrarlo */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">

        {/* Top bar — solo visible en mobile */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-surface border-b border-outline-variant/20 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-full hover:bg-surface-low transition-colors text-on-surface-variant"
            aria-label="Abrir menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <img src="/logo-ef.png" alt="Ediciones Felicitas" className="h-8" />
          <span className="text-[0.625rem] font-bold uppercase tracking-widest text-outline">Panel Admin</span>
        </header>

        {/* Contenido — pt-16 en mobile para compensar el top bar fijo */}
        <main className="flex-1 pt-16 lg:pt-0 p-4 sm:p-6 lg:p-12 bg-surface">
          {children}
        </main>

      </div>
    </div>
  );
}
