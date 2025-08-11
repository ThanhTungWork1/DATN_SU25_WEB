import { useState, useEffect } from "react";
import axios from "axios";
import type { CartItem, CartResponse } from "../types/CartType";

export default function useCart(token: string) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const fetchCart = async () => {
    try {
      const currentToken = localStorage.getItem('user_token');

      
      if (!currentToken) {
        console.warn("⚠️ No token found, setting empty cart");
        setCartItems([]);
        return;
      }
      
      const res = await axios.get<CartResponse>("http://localhost:8000/api/cart", {
        headers: { 
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      
      // Debug: Log each item's size and color
      res.data.cart_items?.forEach((item: any, index: number) => {
      });
      
      setCartItems(res.data.cart_items || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setCartItems([]);
      } else {
        // Fallback: set empty cart
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
    } catch (error: any) {
      console.error("❌ Lỗi cập nhật:", error);
      console.error("Error response:", error.response?.data);
    }
  };

  const removeItem = async (id: number) => {
    try {

      await axios.delete(`http://localhost:8000/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchCart();
    } catch (error: any) {

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
    } catch (error: any) {

    }
  };

  const addToCart = async (item: any) => {
    try {
      const currentToken = localStorage.getItem('user_token');

      
      if (!currentToken) {
        throw new Error('No authentication token found');
      }
      
      // CartController yêu cầu product_id trong validation
      const cartItem: any = {
        product_id: item.product_id,
        quantity: item.quantity || 1,
        price: item.price || 0
      };
      
      // ✅ Chỉ thêm variant_id nếu có giá trị hợp lệ
      if (item.variant_id && item.variant_id !== null && item.variant_id !== undefined) {
        cartItem.variant_id = item.variant_id;
      } else {
      }
      
      const requestData = {
        cartItems: [cartItem]
      };
   
      
      const response = await axios.post("http://localhost:8000/api/cart", requestData, {
        headers: { 
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      
      // Refresh cart sau khi thêm thành công
      await fetchCart();
    } catch (error: any) {
      console.error('ADD_TO_CART ERROR', error?.response?.status, error?.response?.data || error?.message || error);
      throw error; // Throw error để ProductActions có thể bắt
    }
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
