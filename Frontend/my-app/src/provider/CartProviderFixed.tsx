import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { CartItem, CartContextType } from "../types/CartType";
import axios from "axios";
import { toast } from "sonner";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [token, setToken] = useState<string | null>(null);

  // Lắng nghe sự thay đổi của localStorage để cập nhật token
  useEffect(() => {
    // Kiểm tra cả 'token' và 'user_token' để đảm bảo tương thích
    const storedToken =
      localStorage.getItem("token") || localStorage.getItem("user_token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const fetchCart = useCallback(async () => {
    if (!token) {
      setCartItems([]);
      return;
    }
    try {
      const response = await axios.get("http://localhost:8000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems((response.data as any).cartItems || []);
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
      setCartItems([]);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (item: CartItem) => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/api/cart",
        {
          cartItems: [
            {
              variant_id: item.variant_id,
              quantity: item.quantity,
              price: item.price,
            },
          ],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Đã thêm sản phẩm vào giỏ hàng!");
      fetchCart();
    } catch (error: any) {
      console.error("Lỗi thêm sản phẩm:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      } else {
        toast.error("Thêm sản phẩm vào giỏ hàng thất bại!");
      }
    }
  };

  const removeFromCart = async (id: number) => {
    if (!token) return;
    try {
      await axios.delete(`http://localhost:8000/api/cart-item/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
      fetchCart();
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      toast.error("Xóa sản phẩm thất bại!");
    }
  };

  const clearCart = async () => {
    if (!token) return;
    try {
      await axios.delete("http://localhost:8000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Đã xóa toàn bộ giỏ hàng!");
      setCartItems([]);
    } catch (error) {
      console.error("Lỗi xóa toàn bộ giỏ hàng:", error);
      toast.error("Xóa toàn bộ giỏ hàng thất bại!");
    }
  };

  // Alias for removeFromCart to match interface
  const removeItem = removeFromCart;

  const updateQuantity = async (id: number, quantity: number) => {
    if (!token) return;
    try {
      await axios.put(
        `http://localhost:8000/api/cart-item/${id}`,
        {
          quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Đã cập nhật số lượng!");
      fetchCart();
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
      toast.error("Cập nhật số lượng thất bại!");
    }
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    removeItem,
    updateQuantity,
    clearCart,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
