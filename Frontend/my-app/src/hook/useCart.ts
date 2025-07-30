import { useState, useEffect } from "react";
import axios from "axios";
import type { CartItem, CartResponse } from "../types/CartType";


export default function useCart(token: string) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const fetchCart = async () => {
    try {
      const res = await axios.get<CartResponse>("http://localhost:8000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data.cartItems || []);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    try {
      await axios.put(`http://localhost:8000/api/cart/${id}`, { quantity }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
    }
  };

  const removeItem = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error) {
      console.error("Lỗi xóa:", error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.post("http://localhost:8000/api/cart-clear", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems([]);
    } catch (error) {
      console.error("Lỗi xóa toàn bộ:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return {
    cartItems,
    fetchCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
