import { useState, useEffect } from "react";
import axios from "axios";
import type { CartItem, CartResponse } from "../types/CartType";

export default function useCart(token: string) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const fetchCart = async () => {
    try {
      const currentToken = localStorage.getItem('token');
      console.log("🔄 Fetching cart with token:", currentToken ? 'Token exists' : 'No token');
      
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
      console.log("✅ Cart fetched successfully:", res.data);
      setCartItems(res.data.cart_items || []);
    } catch (error: any) {
      console.error("❌ Lỗi fetch cart:", error);
      console.error("❌ Error details:", error.response?.data);
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
      console.log("🧪 Updating quantity for cart item ID:", id, "to:", quantity);
      await axios.put(
        `http://localhost:8000/api/cart/${id}`,
        { quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("✅ Update quantity successful");
      fetchCart();
    } catch (error: any) {
      console.error("❌ Lỗi cập nhật:", error);
      console.error("Error response:", error.response?.data);
    }
  };

  const removeItem = async (id: number) => {
    try {
      console.log("🧪 Removing cart item ID:", id);
      await axios.delete(`http://localhost:8000/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Remove item successful");
      fetchCart();
    } catch (error: any) {
      console.error("❌ Lỗi xóa:", error);
      console.error("Error response:", error.response?.data);
    }
  };

  const clearCart = async () => {
    try {
      console.log("🧪 Clearing entire cart");
      await axios.post(
        "http://localhost:8000/api/cart-clear",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("✅ Clear cart successful");
      setCartItems([]);
    } catch (error: any) {
      console.error("❌ Lỗi xóa toàn bộ:", error);
      console.error("Error response:", error.response?.data);
    }
  };

  const addToCart = async (item: any) => {
    try {
      const currentToken = localStorage.getItem('token');
      console.log("🛒 Adding to cart:", item);
      console.log("🔑 Using token:", currentToken ? 'Token exists' : 'No token');
      
      if (!currentToken) {
        throw new Error('No authentication token found');
      }
      
      // CartController yêu cầu product_id trong validation
      const requestData = {
        cartItems: [
          {
            product_id: item.product_id,
            quantity: item.quantity || 1,
            price: item.price || 0
          }
        ]
      };
      
      console.log("📝 Request data:", requestData);
      
      const response = await axios.post("http://localhost:8000/api/cart", requestData, {
        headers: { 
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      
      console.log("✅ Added to cart successfully:", response.data);
      fetchCart(); // Refresh cart
    } catch (error: any) {
      console.error("❌ Lỗi thêm vào giỏ hàng:", error);
      console.error("Error response:", error.response?.data);
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