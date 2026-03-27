import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../contexts/CartContext';
import type { Book } from '../types';
import { Button } from '../components/ui/Button';
import './DetalleLibro.scss';

const DetalleLibro: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [format, setFormat] = useState<'physical' | 'digital'>('physical');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await api.get(`/api/books/${slug}`);
        setBook(data.data);
        // Setear formato default basado en disponibilidad
        if (!data.data.hasPhysical && data.data.hasDigital) {
          setFormat('digital');
        }
      } catch (err: any) {
        setError(err.response?.status === 404 ? 'Libro no encontrado' : 'Error al cargar el libro');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [slug]);

  if (loading) return <div className="container py-16 text-center"><div className="spinner"></div></div>;
  if (error || !book) return <div className="container py-16 text-center text-error">{error}</div>;

  const imageUrl = book.coverImage
    ? `/${book.coverImage}`
    : '/placeholder-book.jpg';

  const currentPrice = format === 'physical' ? book.physicalPrice : book.digitalPrice;
  const isOutOfStock = format === 'physical' && book.physicalStock <= 0;

  const handleAddToCart = () => {
    if (!currentPrice) return;
    
    setAddingToCart(true);
    addItem({
      bookId: book.id,
      title: book.title,
      author: book.author,
      type: format,
      unitPrice: currentPrice,
      quantity: format === 'physical' ? quantity : 1, // Digital siempre 1
      coverImage: book.coverImage,
    });
    
    setTimeout(() => {
      setAddingToCart(false);
      navigate('/carrito');
    }, 500);
  };

  return (
    <div className="detalle-libro">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="detalle-libro__breadcrumbs">
          <Link to="/">Inicio</Link>
          <span className="separator">/</span>
          <Link to="/catalogo">Catálogo</Link>
          <span className="separator">/</span>
          <span className="current">{book.title}</span>
        </nav>

        <div className="detalle-libro__layout">
          {/* Imagen */}
          <div className="detalle-libro__image-col">
            <div className="detalle-libro__image-wrapper">
              <img src={imageUrl} alt={book.title} className="detalle-libro__cover" />
            </div>
          </div>

          {/* Info */}
          <div className="detalle-libro__info-col">
            <h1 className="detalle-libro__title">{book.title}</h1>
            <p className="detalle-libro__author">Por {book.author}</p>
            
            <div className="detalle-libro__price">
              ${currentPrice?.toLocaleString('es-AR') || 'N/A'}
            </div>

            <p className="detalle-libro__desc">
              {book.description || 'Página de detalles de este título en Ediciones Felicitas. Literatura para los sentidos.'}
            </p>

            {/* Selector de formato */}
            <div className="detalle-libro__formats">
              <h3 className="detalle-libro__formats-title">Formato</h3>
              <div className="detalle-libro__formats-grid">
                {book.hasPhysical && (
                  <button
                    className={`format-btn ${format === 'physical' ? 'active' : ''} ${book.physicalStock <= 0 ? 'disabled' : ''}`}
                    onClick={() => setFormat('physical')}
                    disabled={book.physicalStock <= 0}
                  >
                    <span className="format-btn__name">Libro Físico</span>
                    <span className="format-btn__price">${book.physicalPrice?.toLocaleString('es-AR')}</span>
                    {book.physicalStock <= 0 && <span className="format-btn__stock">Sin stock</span>}
                  </button>
                )}
                {book.hasDigital && (
                  <button
                    className={`format-btn ${format === 'digital' ? 'active' : ''}`}
                    onClick={() => setFormat('digital')}
                  >
                    <span className="format-btn__name">E-Book (Digital)</span>
                    <span className="format-btn__price">${book.digitalPrice?.toLocaleString('es-AR')}</span>
                    <span className="format-btn__stock">Envío instantáneo por email</span>
                  </button>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="detalle-libro__actions">
              {format === 'physical' && !isOutOfStock && (
                <div className="quantity-selector">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >-</button>
                  <span>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(book.physicalStock, q + 1))}
                    disabled={quantity >= book.physicalStock}
                  >+</button>
                </div>
              )}
              
              <Button 
                size="lg" 
                fullWidth 
                onClick={handleAddToCart}
                disabled={isOutOfStock || !currentPrice}
                isLoading={addingToCart}
              >
                {isOutOfStock ? 'Agotado' : 'Agregar al Carrito'}
              </Button>
            </div>

            {/* Specs */}
            <div className="detalle-libro__specs">
              <dl>
                <div>
                  <dt>Editorial</dt>
                  <dd>{book.editorial}</dd>
                </div>
                {book.year && (
                  <div>
                    <dt>Año de Edición</dt>
                    <dd>{book.year}</dd>
                  </div>
                )}
                {book.isbn && format === 'physical' && (
                  <div>
                    <dt>ISBN</dt>
                    <dd>{book.isbn}</dd>
                  </div>
                )}
                <div>
                  <dt>Idioma</dt>
                  <dd>{book.language}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleLibro;
