import { useState, useEffect } from "react";
import axios from "axios";
import { CartResponse } from "../types/CartType";

const useCart = (token: string) => {
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching cart with token:", token ? 'Token exists' : 'No token');
      const response = await axios.get("http://localhost:8000/api/simple-cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Cart fetched successfully:", response.data);
      setCartData(response.data as CartResponse);
    } catch (error: any) {
      console.error("❌ Error fetching cart:", error);
      // Fallback: set empty cart data
      setCartData({ id: 0, user_id: 0, cart_items: [] } as CartResponse);
    } finally {
      setLoading(false);
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
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error: any) {
      console.error("Error removing item:", error);
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
      fetchCart();
    } catch (error: any) {
      console.error("Error clearing cart:", error);
    }
  };

  const addToCart = async (variantId: number, quantity: number = 1) => {
    try {
      console.log("🛒 Adding to cart - Variant ID:", variantId, "Quantity:", quantity);
      await axios.post(
        "http://localhost:8000/api/simple-cart/add",
        {
          variant_id: variantId,
          quantity: quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("✅ Added to cart successfully");
      fetchCart();
    } catch (error: any) {
      console.error("❌ Error adding to cart:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  return {
    cartData,
    loading,
    fetchCart,
    updateQuantity,
    removeItem,
    clearCart,
    addToCart,
  };
};

export default useCart;
