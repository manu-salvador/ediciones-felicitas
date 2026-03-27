import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import type { Book, Category, PaginatedResponse } from '../types';
import { BookCard } from '../components/ui/BookCard';
import './Catalogo.scss';

const Catalogo: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentCategory = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [totalPages, setTotalPages] = useState(1);

  // Cargar categorías (filtro)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/api/categories');
        setCategories(data.data);
      } catch (err) {
        console.error('Error al cargar categorías', err);
      }
    };
    fetchCategories();
  }, []);

  // Cargar libros
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<PaginatedResponse<Book>>('/api/books', {
          params: {
            page,
            limit: 9,
            category: currentCategory || undefined,
          },
        });
        setBooks(data.data);
        setTotalPages(data.pagination.totalPages);
        setError('');
      } catch (err) {
        setError('Ocurrió un error al cargar el catálogo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [page, currentCategory]);

  const handleCategoryChange = (slug: string) => {
    if (slug === currentCategory) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    searchParams.set('page', '1'); // Volver a pag 1
    setSearchParams(searchParams);
  };

  const currentCategoryName = categories.find(c => c.slug === currentCategory)?.name;

  return (
    <div className="catalogo">
      <header className="catalogo__header">
        <div className="container">
          <h1 className="catalogo__title">Catálogo Editorial</h1>
          <p className="catalogo__subtitle">
            {currentCategoryName 
              ? `Explorando la colección de ${currentCategoryName}` 
              : 'Descubra nuestra selección completa curada para los amantes de la literatura.'}
          </p>
        </div>
      </header>

      <div className="container catalogo__layout">
        {/* Sidebar de filtros */}
        <aside className="catalogo__sidebar">
          <div className="catalogo__filter-group">
            <h3 className="catalogo__filter-title">Categorías</h3>
            <ul className="catalogo__filter-list">
              <li>
                <button
                  className={`catalogo__filter-btn ${!currentCategory ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('')}
                >
                  <span className="catalogo__filter-label">Todas las obras</span>
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    className={`catalogo__filter-btn ${currentCategory === cat.slug ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat.slug)}
                  >
                    <span className="catalogo__filter-label">{cat.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Grilla principal */}
        <div className="catalogo__main">
          {loading ? (
            <div className="catalogo__loading">
              <div className="spinner"></div>
              <p>Cargando colección...</p>
            </div>
          ) : error ? (
            <div className="catalogo__error">{error}</div>
          ) : books.length === 0 ? (
            <div className="catalogo__empty">
              <h3>No se encontraron obras</h3>
              <p>Intente remover los filtros para ver el catálogo completo.</p>
            </div>
          ) : (
            <>
              <div className="catalogo__grid">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    slug={book.slug}
                    title={book.title}
                    author={book.author}
                    price={book.physicalPrice || book.digitalPrice || 0}
                    coverImage={book.coverImage || undefined}
                    isDigitalOnly={!book.hasPhysical && book.hasDigital}
                  />
                ))}
              </div>

              {/* Paginación simple */}
              {totalPages > 1 && (
                <div className="catalogo__pagination">
                  <button
                    disabled={page <= 1}
                    onClick={() => { searchParams.set('page', String(page - 1)); setSearchParams(searchParams); }}
                    className="catalogo__page-btn"
                  >
                    Anterior
                  </button>
                  <span className="catalogo__page-info">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => { searchParams.set('page', String(page + 1)); setSearchParams(searchParams); }}
                    className="catalogo__page-btn"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalogo;
