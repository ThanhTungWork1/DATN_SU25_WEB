<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect } from "react";
import type { CartItem, CartContextType } from "../types/CartType";
=======
import React, { createContext, useContext, useState, useEffect } from 'react';

export type CartItem = {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    color?: string;
    size?: string;
};

type CartContextType = {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
};
>>>>>>> f51a0d77 (trang detail hoan thien)

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
<<<<<<< HEAD
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem("cartItems");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const exist = prev.find(
        (i) =>
          i.id === item.id && i.color === item.color && i.size === item.size,
      );
      if (exist) {
        return prev.map((i) =>
          i.id === item.id && i.color === item.color && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i,
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
=======
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const stored = localStorage.getItem('cartItems');
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (item: CartItem) => {
        setCartItems(prev => {
            const exist = prev.find(
                i => i.id === item.id && i.color === item.color && i.size === item.size
            );
            if (exist) {
                return prev.map(i =>
                    i.id === item.id && i.color === item.color && i.size === item.size
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prev, item];
        });
    };

    const removeFromCart = (id: number) => {
        setCartItems(prev => prev.filter(i => i.id !== id));
    };

    const clearCart = () => setCartItems([]);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}; 
>>>>>>> f51a0d77 (trang detail hoan thien)
