import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'ef_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    // Items sin slug son datos obsoletos (pre-migración) — los descartamos
    if (!Array.isArray(items) || items.some((i) => !i.slug)) return [];
    return items;
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (book, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.bookId === book.id);
      if (existing) {
        return prev.map((i) =>
          i.bookId === book.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, {
        bookId: book.id,
        slug: book.slug,
        titulo: book.titulo,
        autor: book.autor,
        precio: Number(book.precio),
        imagen: book.imagen,
        edicion: book.edicion || 'fisico',
        tieneDigital: book.tieneDigital || false,
        qty,
      }];
    });
  };

  const updateQty = (bookId, qty) => {
    if (qty <= 0) return removeItem(bookId);
    setItems((prev) => prev.map((i) => (i.bookId === bookId ? { ...i, qty } : i)));
  };

  const removeItem = (bookId) => {
    setItems((prev) => prev.filter((i) => i.bookId !== bookId));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + i.precio * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
