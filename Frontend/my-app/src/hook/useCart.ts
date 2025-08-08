import { useState, useEffect } from "react";
import { config as axios } from "../api/axios";
import type { CartItem, CartResponse } from "../types/CartType";

export default function useCart(token: string) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const fetchCart = async () => {
    try {
      const res = await axios.get<CartResponse>("/cart");
      setCartItems(res.data.cart_items || []); // SỬA LẠI: cart_items thay vì cartItems
    } catch (error) {
      if (error.response?.status === 404) {
        setCartItems([]);
      }
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    try {
      await axios.put(
        `http://localhost:8000/api/cart/${id}`,
        { quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      await axios.post(
        "http://localhost:8000/api/cart-clear",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCartItems([]);
    } catch (error) {
      console.error("Lỗi xóa toàn bộ:", error);
    }
  };

  const addToCart = async (item: any) => {
    try {
      const requestData = {
        cartItems: [
          {
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          },
        ],
      };
      await axios.post("/cart", requestData);
      fetchCart();
    } catch (error) {}
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return {
    cartItems,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
