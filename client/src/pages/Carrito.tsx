import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/Button';
import './Carrito.scss';

const Carrito: React.FC = () => {
  const { items, updateQuantity, removeItem, total, itemCount, clearCart } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="carrito carrito--empty container">
        <div className="carrito__empty-box">
          <h2>Su carrito está vacío</h2>
          <p>Descubra nuestra colección editorial y agregue títulos a su carrito.</p>
          <Link to="/catalogo">
            <Button size="lg">Explorar Catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="carrito container">
      <header className="carrito__header">
        <h1 className="carrito__title">Su Carrito</h1>
        <p className="carrito__subtitle">{itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}</p>
      </header>

      <div className="carrito__layout">
        <div className="carrito__main">
          <div className="carrito__items">
            {items.map((item) => {
              const imageUrl = item.coverImage
                ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/uploads/covers/${item.coverImage}`
                : '/placeholder-book.jpg';

              return (
                <div key={`${item.bookId}-${item.type}`} className="carrito__card">
                  <div className="carrito__card-img-wrapper">
                    <img src={imageUrl} alt={item.title} className="carrito__card-img" />
                  </div>
                  
                  <div className="carrito__card-info">
                    <div className="carrito__card-header">
                      <div>
                        <h3 className="carrito__card-title">
                          <Link to={`/libro/${item.bookId}`}>{item.title}</Link>
                        </h3>
                        <p className="carrito__card-author">{item.author}</p>
                        <span className="carrito__card-badge">
                          {item.type === 'physical' ? 'Libro Físico' : 'E-Book (Digital)'}
                        </span>
                      </div>
                      <div className="carrito__card-price">
                        ${item.unitPrice.toLocaleString('es-AR')}
                      </div>
                    </div>

                    <div className="carrito__card-actions">
                      {item.type === 'physical' ? (
                        <div className="quantity-selector">
                          <button onClick={() => updateQuantity(item.bookId, item.type, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.bookId, item.type, item.quantity + 1)}>+</button>
                        </div>
                      ) : (
                        <span className="digital-qty">Cant: 1 (Envío Digital)</span>
                      )}
                      
                      <button 
                        className="carrito__card-remove" 
                        onClick={() => removeItem(item.bookId, item.type)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="carrito__clear">
            <button className="text-btn" onClick={clearCart}>Vaciar carrito</button>
          </div>
        </div>

        <aside className="carrito__sidebar">
          <div className="carrito__summary">
            <h3 className="carrito__summary-title">Resumen de compra</h3>
            
            <div className="carrito__summary-row">
              <span>Subtotal ({itemCount} productos)</span>
              <span>${total.toLocaleString('es-AR')}</span>
            </div>
            
            <div className="carrito__summary-row carrito__summary-row--highlight">
              <span>Total a pagar</span>
              <span className="carrito__summary-total">${total.toLocaleString('es-AR')}</span>
            </div>

            <p className="carrito__summary-note">
              Los costos de envío (si aplican) se calcularán en el próximo paso.
            </p>

            <Button size="lg" fullWidth onClick={() => navigate('/checkout')}>
              Ir al Pago
            </Button>
            
            <Link to="/catalogo" className="carrito__summary-link">
              Seguir comprando
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Carrito;
