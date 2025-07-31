import { useState, useEffect } from "react";
import { config as axios } from "../api/axios";
import type { CartItem, CartResponse } from "../types/CartType";


export default function useCart(token: string) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const fetchCart = async () => {
    try {
      console.log("=== DEBUG FETCH CART ===");
      const res = await axios.get<CartResponse>("/cart");
      console.log("Cart response:", res.data);
      console.log("Cart items:", res.data.cart_items); // SỬA LẠI: cart_items thay vì cartItems
      // Backend trả về toàn bộ cart object, cart_items nằm trong đó
      setCartItems(res.data.cart_items || []); // SỬA LẠI: cart_items thay vì cartItems
      console.log("✅ Fetch cart successful, items count:", res.data.cart_items?.length || 0); // SỬA LẠI: cart_items
    } catch (error) {
      console.error("❌ Lỗi khi lấy giỏ hàng:", error);
      console.error("Error response:", error.response?.data);
      // Nếu không có giỏ hàng, set rỗng
      if (error.response?.status === 404) {
        setCartItems([]);
      }
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

  const addToCart = async (item: any) => {
    try {
      console.log("=== DEBUG ADD TO CART ===");
      console.log("Token:", token);
      console.log("Item being sent:", item);
      
      const requestData = {
        cartItems: [
          {
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          }
        ]
      };
      
      console.log("Request data:", requestData);
      
      await axios.post("/cart", requestData);
      console.log("✅ Add to cart successful");
      fetchCart();
    } catch (error) {
      console.error("❌ Lỗi thêm vào giỏ hàng:", error);
      console.error("Error response:", error.response?.data);
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
