import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import './BookCard.scss';

export interface BookCardProps {
  id: string;
  slug: string;
  title: string;
  author: string;
  price: number;
  coverImage?: string;
  isDigitalOnly?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  slug,
  title,
  author,
  price,
  coverImage,
  isDigitalOnly = false,
}) => {
  // coverImage viene como "covers/Nombre.png" desde la API.
  // Las imágenes se sirven desde client/public/covers/ via Vite (sin servidor intermediario).
  // En producción, subir las imágenes a CDN/static hosting y ajustar esta lógica.
  const imageUrl = coverImage
    ? `/${coverImage}`      // → /covers/Macacha-Guemes-mockup.png (public/ de Vite)
    : undefined;

  return (
    <div className="book-card">
      <Link to={`/libro/${slug}`} className="book-card__image-container">
        <img src={imageUrl} alt={`Portada de ${title}`} className="book-card__image" loading="lazy" />
        {isDigitalOnly && <span className="book-card__badge">E-Book</span>}
      </Link>
      
      <div className="book-card__content">
        <Link to={`/libro/${slug}`} className="book-card__title">
          {title}
        </Link>
        <p className="book-card__author">{author}</p>
        
        <div className="book-card__footer">
          <span className="book-card__price">
            ${price.toLocaleString('es-AR')}
          </span>
          <Link to={`/libro/${slug}`}>
            <Button variant="secondary" size="sm">Ver detalles</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
