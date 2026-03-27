import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  bookId: string;
  type: 'physical' | 'digital';
  title: string;
  author: string;
  coverImage: string | null;
  unitPrice: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (bookId: string, type: 'physical' | 'digital') => void;
  updateQuantity: (bookId: string, type: 'physical' | 'digital', quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  hasPhysicalItems: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'ef_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistir el carrito en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.bookId === newItem.bookId && i.type === newItem.type);
      if (existing) {
        // Ya existe — incrementar cantidad
        return prev.map((i) =>
          i.bookId === newItem.bookId && i.type === newItem.type
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (bookId: string, type: 'physical' | 'digital') => {
    setItems((prev) => prev.filter((i) => !(i.bookId === bookId && i.type === type)));
  };

  const updateQuantity = (bookId: string, type: 'physical' | 'digital', quantity: number) => {
    if (quantity <= 0) {
      removeItem(bookId, type);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.bookId === bookId && i.type === type ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasPhysicalItems = items.some((i) => i.type === 'physical');

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, hasPhysicalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
};
