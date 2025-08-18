import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import type { CartItem, CartContextType } from "../types/CartType";
import axios from "axios";
import { toast } from "sonner";

// Giả sử bạn vẫn còn file tokenUtils.ts từ các bước trước
// Nếu không, bạn cần tạo lại nó với TokenManager
import { TokenManager } from "../utils/tokenUtils";

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
  const [token, setToken] = useState<string | null>(
    TokenManager.getUserToken()
  );
  const location = useLocation();

  // Hàm xử lý khi token thay đổi - CHỈ THEO DÕI USER TOKEN
  const handleTokenChange = useCallback(() => {
    const currentToken = TokenManager.getUserToken();
    setToken(currentToken);
  }, []);

  // Lắng nghe sự kiện thay đổi token
  useEffect(() => {
    handleTokenChange(); // Kiểm tra ngay lúc đầu

    // Lắng nghe sự kiện 'storage' (cho các tab khác)
    window.addEventListener("storage", handleTokenChange);
    // Lắng nghe sự kiện tùy chỉnh 'token-changed' (cho cùng một tab)
    window.addEventListener("token-changed", handleTokenChange);

    return () => {
      window.removeEventListener("storage", handleTokenChange);
      window.removeEventListener("token-changed", handleTokenChange);
    };
  }, [handleTokenChange]);

    const fetchCart = useCallback(async () => {
    // Không fetch giỏ hàng nếu đang ở trang admin
    if (location.pathname.startsWith("/admin")) {
      setCartItems([]);
      return;
    }

    if (!token) {
      setCartItems([]);
      return;
    }
    try {
      // FIX: Thêm kiểu cho response data để TypeScript không báo lỗi
      const response = await axios.get<any>("http://localhost:8000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Lấy mảng cart_items từ response. Nếu không có hoặc không phải là mảng, dùng mảng rỗng.
      
      const rawCartItems = Array.isArray(response.data?.cart_items) 
        ? response.data.cart_items 
        : [];

      // Transform data to match the CartItem type, preserving the nested structure
      const transformedCartItems: CartItem[] = rawCartItems.map((item: any) => ({
        id: item.id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        price: item.price,
        // Provide fallback name and image from the variant's product info
        name: item.product_variant?.product?.name || "Sản phẩm không tên",
        image: item.product_variant?.product?.image_url,
        // CRITICAL: Pass the entire nested product_variant object as expected by the type
        product_variant: item.product_variant,
      }));

      setCartItems(transformedCartItems);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { status: number }, message: string };
        if (axiosError.response && axiosError.response.status !== 404) {
          console.error("Lỗi khi lấy giỏ hàng:", axiosError.message);
        }
      } else {
        console.error("Lỗi không xác định khi lấy giỏ hàng:", error);
      }
      setCartItems([]);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (item: CartItem) => {
    const currentToken = TokenManager.getUserToken();
    if (!currentToken) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }

    // Ensure we have the necessary IDs from the new data structure
    const productId = item.product_variant?.product?.id;
    const variantId = item.product_variant_id || item.product_variant?.id;

    if (!productId || !variantId) {
      toast.error("Thông tin sản phẩm không đầy đủ, không thể thêm vào giỏ hàng.");
      console.error("Missing product_id or variant_id in item:", item);
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/api/cart",
        {
          cartItems: [
            {
              product_id: productId,
              variant_id: variantId,
              quantity: item.quantity,
              price: item.price,
            },
          ],
        },
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );
      toast.success("Đã thêm sản phẩm vào giỏ hàng!");
      fetchCart(); // Refresh cart from server
    } catch (error) {
      let message = "Thêm sản phẩm thất bại!";
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        }
      }
      toast.error(message);
      console.error("Lỗi thêm sản phẩm:", error);
    }
  };

  const removeFromCart = async (id: number) => {
    const currentToken = TokenManager.getUserToken();
    if (!currentToken) return;
    try {
      // Đảm bảo gọi đúng API: DELETE /api/cart/items/{id}
      await axios.delete(`http://localhost:8000/api/cart/items/${id}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
      fetchCart(); // Tải lại giỏ hàng để cập nhật UI
    } catch (error) {
      toast.error("Xóa sản phẩm thất bại!");
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  const clearCart = async () => {
    const currentToken = TokenManager.getUserToken();
    if (!currentToken) return;
    try {
      // Đảm bảo gọi đúng API: POST /api/cart/clear
      await axios.post(`http://localhost:8000/api/cart/clear`, null, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      toast.success("Đã xóa toàn bộ giỏ hàng!");
      setCartItems([]); // Cập nhật state ngay để UI phản hồi nhanh
    } catch (error) {
      toast.error("Xóa giỏ hàng thất bại!");
      console.error("Lỗi khi xóa toàn bộ giỏ hàng:", error);
    }
  };

  const removeItem = removeFromCart;

  const updateQuantity = async (id: number, quantity: number) => {
    const currentToken = TokenManager.getUserToken();
    if (!currentToken) return;
    try {
      // SỬA: Gọi đúng API cập nhật một sản phẩm
      await axios.post(
        `http://localhost:8000/api/cart/items/${id}`,
        { quantity },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
      toast.success("Đã cập nhật số lượng!");
      fetchCart();
    } catch (error) {
      let message = "Cập nhật số lượng thất bại!";
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        }
      }
      toast.error(message);
      console.error("Lỗi cập nhật số lượng:", error);
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
