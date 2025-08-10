import { useState, useEffect } from "react";
import { config as axios } from "../api/axios";
import type { CartItem, CartResponse } from "../types/CartType";

export default function useCart(token: string) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const fetchCart = async () => {
    // Thêm điều kiện kiểm tra token ở đây
    if (!token) {
      console.log("Không có token, không thể lấy giỏ hàng.");
      setCartItems([]); // Đảm bảo giỏ hàng trống nếu không có token
      return;
    }

    try {
      const res = await axios.get<CartResponse>("http://localhost:8000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Handle new backend structure: response.data.cart.cartItems
      let rawCartItems = [];
      if (res.data.cart && res.data.cart.cartItems) {
        rawCartItems = res.data.cart.cartItems;
      } else if (res.data.cartItems) {
        rawCartItems = res.data.cartItems;
      } else if (res.data.cart_items) {
        rawCartItems = res.data.cart_items;
      }
      
      // Transform data từ nested structure thành flat structure (giống CartProvider)
      const transformedCartItems = rawCartItems.map((item: any) => ({
          id: item.id,
          product_id: item.variant?.product?.id || item.product_id,
          variant_id: item.variant_id,
          name: item.variant?.product?.name || item.name || 'Sản phẩm không tên',
          price: item.price,
          quantity: item.quantity,
          image: item.variant?.image_url || item.variant?.image || item.variant?.product?.image_url || item.variant?.product?.image || item.image,
          color: item.variant?.color?.name || item.color,
          size: item.variant?.size?.name || item.size,
          product: item.variant?.product,
          variant: item.variant
      }));
      
      setCartItems(transformedCartItems);
    } catch (error: any) {
      console.error("Lỗi lấy giỏ hàng:", error);
      if (error.response?.status === 404) {
        setCartItems([]);
      }
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    try {
      await axios.put(`http://localhost:8000/api/cart-item/${id}`, { quantity }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
    }
  };

  const removeItem = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/cart-item/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error) {
      console.error("Lỗi xóa:", error);
    }
  };

  const addToCart = async (variantId: number, quantity: number, price: number) => {
    if (!token) {
      console.error("Không có token, không thể thêm vào giỏ hàng.");
      throw new Error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/cart",
        {
          cartItems: [{
            variant_id: variantId,
            quantity: quantity,
            price: price
          }]
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      // Refresh cart after adding
      await fetchCart();
      return response.data;
    } catch (error: any) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      if (error.response?.status === 401) {
        throw new Error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      }
      throw new Error(error.response?.data?.message || "Lỗi khi thêm sản phẩm vào giỏ hàng!");
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete("http://localhost:8000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems([]);
    } catch (error) {
      console.error("Lỗi xóa toàn bộ:", error);
    }
  };

  useEffect(() => {
    // Gọi fetchCart khi component được mount và mỗi khi 'token' thay đổi
    fetchCart();
  }, [token]); // <--- THAY ĐỔI QUAN TRỌNG: Thêm 'token' vào dependency array

  return {
    cartItems,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
}