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
      console.log("🧪 Updating quantity for cart item ID:", id, "to:", quantity);
      await axios.put(`/cart/${id}`, { quantity });
      console.log("✅ Update quantity successful");
      fetchCart();
    } catch (error) {
      console.error("❌ Lỗi cập nhật:", error);
      console.error("Error response:", error.response?.data);
    }
  };

  const removeItem = async (id: number) => {
    try {
      console.log("🧪 Removing cart item ID:", id);
      await axios.delete(`/cart/${id}`);
      console.log("✅ Remove item successful");
      fetchCart();
    } catch (error) {
      console.error("❌ Lỗi xóa:", error);
      console.error("Error response:", error.response?.data);
    }
  };

  const clearCart = async () => {
    try {
      console.log("🧪 Clearing entire cart");
      await axios.post("/cart-clear", {});
      console.log("✅ Clear cart successful");
      setCartItems([]);
    } catch (error) {
      console.error("❌ Lỗi xóa toàn bộ:", error);
      console.error("Error response:", error.response?.data);
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
