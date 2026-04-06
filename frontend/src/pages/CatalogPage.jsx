import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Spinner from '../components/ui/Spinner';
import ErrorPage from './ErrorPage';
import api from '../services/api';

const formatPeso = (n) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

function BookCard({ book }) {
  return (
    <Link to={`/libro/${book.slug || book.id}`} className="group cursor-pointer block">
      <div className="aspect-[2/3] bg-surface-high rounded-lg mb-4 overflow-hidden relative shadow-sm group-hover:shadow-xl transition-all duration-500 transform group-hover:-translate-y-1">
        {book.imagen ? (
          <img src={book.imagen} alt={book.titulo} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-container/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-primary/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-headline font-bold text-on-surface line-clamp-2 leading-snug">{book.titulo}</h3>
        {book.autor && <p className="text-xs text-on-surface-variant font-medium tracking-wide uppercase">{book.autor}</p>}
        {book.categoria && (
          <span className="inline-block text-xs bg-primary-container/25 text-primary px-2 py-0.5 rounded-full">{book.categoria}</span>
        )}
        <p className="text-lg font-headline font-bold text-tertiary pt-1">{formatPeso(book.precio)}</p>
      </div>
    </Link>
  );
}

export default function CatalogPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');

  const fetchBooks = useCallback(() => {
    setLoading(true);
    setError(false);
    api.get('/books')
      .then(({ data }) => setBooks(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  if (error) return <ErrorPage onRetry={fetchBooks} />;

  const categorias = [...new Set(books.map((b) => b.categoria).filter(Boolean))];

  const filtered = books.filter((b) => {
    const matchSearch = b.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (b.autor || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoria || b.categoria === categoria;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 bg-surface-low">
        <div className="max-w-screen-xl mx-auto px-8 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-headline font-bold text-primary tracking-tight leading-tight mb-4">
            Ediciones Felicitas
          </h1>
          <p className="text-lg text-on-surface-variant max-w-xl mx-auto mb-10">
            Una editorial argentina con historias que perduran.
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto bg-white rounded-full shadow-sm border border-outline-variant p-2">
            <div className="flex-1 flex items-center px-4 gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-outline flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título o autor…"
                className="w-full border-none focus:outline-none text-sm bg-transparent"
              />
            </div>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="border-none focus:outline-none text-sm text-on-surface-variant bg-transparent px-4 py-2"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section className="max-w-screen-xl mx-auto px-8 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-tertiary font-bold tracking-widest uppercase text-xs">Colección</span>
            <h2 className="text-3xl font-headline font-bold text-on-surface mt-1">Nuestros libros</h2>
          </div>
          <span className="text-on-surface-variant text-sm">{filtered.length} libro{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant">No se encontraron libros.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-12">
            {filtered.map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant/30 py-12 mt-8">
        <div className="max-w-screen-xl mx-auto px-8 text-center text-on-surface-variant text-sm">
          <img src="/logo-ef.png" alt="Ediciones Felicitas" className="h-20 mx-auto mb-4 opacity-80" />
          <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
