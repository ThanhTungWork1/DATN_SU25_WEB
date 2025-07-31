import React, { createContext, useContext } from "react";
import useCartHook from "../hook/useCart";
import type { CartContextType } from "../types/CartType";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lấy token từ localStorage (hoặc context Auth nếu có)
  const token = localStorage.getItem("token") || "";
  const cart = useCartHook(token);

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
};
