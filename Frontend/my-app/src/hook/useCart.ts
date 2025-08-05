import { useState, useEffect } from "react";
import { config as axios } from "../api/axios";
import type { CartItem, CartResponse } from "../types/CartType";

export default function useCart(token: string) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const fetchCart = async () => {
    try {
      const res = await axios.get<CartResponse>("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data.cart_items || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setCartItems([]);
      } else {
        console.error("❌ Lỗi fetch cart:", error);
      }
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    try {
      console.log("🧪 Updating quantity for cart item ID:", id, "to:", quantity);
      await axios.put(
        `/cart/${id}`,
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
      await axios.delete(`/cart/${id}`, {
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
        "/cart-clear",
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
      const requestData = {
        cartItems: [
          {
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          },
        ],
      };
      await axios.post("/cart", requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error: any) {
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
