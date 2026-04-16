import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Spinner from '../components/ui/Spinner';
import api from '../services/api';

// Desktop: 9 per page, mobile: 5 per page
function usePageLimit() {
  const [limit, setLimit] = useState(() => window.innerWidth >= 768 ? 9 : 5);
  useEffect(() => {
    const handler = () => setLimit(window.innerWidth >= 768 ? 9 : 5);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return limit;
}

function PublicacionCard({ pub }) {
  return (
    <Link
      to={`/publicaciones/${pub.id}`}
      className="group block bg-surface rounded-xl overflow-hidden border border-outline-variant/20 hover:border-primary/30 hover:shadow-md transition-all duration-300"
    >
      {pub.foto ? (
        <div className="aspect-video overflow-hidden">
          <img
            src={pub.foto}
            alt={pub.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-video bg-primary-container/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-primary/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
      )}
      <div className="p-4 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-outline font-bold">
          {new Date(pub.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
        <h3 className="font-headline font-bold text-on-surface text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {pub.titulo}
        </h3>
        <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed break-words">{pub.texto.replace(/\*\*|__|_|\*|^#+\s/gm, '')}</p>
      </div>
    </Link>
  );
}

export default function PublicacionesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page  = Math.max(1, parseInt(searchParams.get('pagina')) || 1);
  const limit = usePageLimit();

  const [pubs, setPubs]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/publicaciones?page=${page}&limit=${limit}`)
      .then(({ data }) => {
        setPubs(data.data);
        setTotal(data.total);
        setPages(data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, limit]);

  const goTo = (p) => {
    setSearchParams(p === 1 ? {} : { pagina: p });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20 px-4 sm:px-8 max-w-screen-xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-headline font-bold tracking-tight text-on-surface">Publicaciones</h1>
          {total > 0 && <p className="text-on-surface-variant mt-2 text-sm">{total} {total === 1 ? 'publicación' : 'publicaciones'}</p>}
        </header>

        {loading ? (
          <Spinner />
        ) : pubs.length === 0 ? (
          <div className="text-center py-24 text-on-surface-variant">
            <p className="font-medium text-lg">No hay publicaciones todavía.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pubs.map((pub) => (
                <PublicacionCard key={pub.id} pub={pub} />
              ))}
            </div>

            {pages > 1 && (
              <nav className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => goTo(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-full text-sm font-bold border border-outline-variant disabled:opacity-30 hover:bg-surface-low transition-colors"
                >
                  ←
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goTo(p)}
                    className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${
                      p === page
                        ? 'bg-primary text-on-primary shadow-md'
                        : 'border border-outline-variant hover:bg-surface-low text-on-surface-variant'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => goTo(page + 1)}
                  disabled={page === pages}
                  className="px-4 py-2 rounded-full text-sm font-bold border border-outline-variant disabled:opacity-30 hover:bg-surface-low transition-colors"
                >
                  →
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
}
