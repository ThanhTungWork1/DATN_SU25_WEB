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

      // Transform data từ nested structure thành flat structure
      const transformedCartItems = rawCartItems.map((item: any) => ({
        id: item.id,
        product_id: item.variant?.product?.id || item.product_id,
        variant_id: item.variant_id,
        name: item.variant?.product?.name || item.name || "Sản phẩm không tên",
        price: item.price,
        quantity: item.quantity,
        image:
          item.variant?.product?.image || item.variant?.image_url || item.image,
        color: item.variant?.color?.name || item.color,
        size: item.variant?.size?.name || item.size,
        product: item.variant?.product,
        variant: item.variant,
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
      return; // Dừng lại ngay lập tức
    }

    try {
      // **FIX 2: Gửi dữ liệu đúng định dạng mà backend yêu cầu**
      await axios.post(
        "http://localhost:8000/api/cart",
        {
          cartItems: [
            {
              product_id: item.product_id, // Thêm product_id
              variant_id: item.variant_id,
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
      fetchCart();
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
      // SỬA: Thay 'cart-item' bằng 'cart' để khớp với apiResource
      await axios.delete(`http://localhost:8000/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
      fetchCart();
    } catch (error) {
      let message = "Xóa sản phẩm thất bại!";
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        }
      }
      toast.error(message);
      console.error("Lỗi xóa sản phẩm:", error);
    }
  };

  const clearCart = async () => {
    const currentToken = TokenManager.getUserToken();
    if (!currentToken) return;
    try {
      // SỬA: Sử dụng POST tới /api/cart-clear theo route đã định nghĩa
      await axios.post("http://localhost:8000/api/cart-clear", null, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      toast.success("Đã xóa toàn bộ giỏ hàng!");
      setCartItems([]); // Cập nhật state ngay lập tức
    } catch (error) {
      let message = "Xóa giỏ hàng thất bại!";
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        }
      }
      toast.error(message);
      console.error("Lỗi xóa toàn bộ giỏ hàng:", error);
    }
  };

  const removeItem = removeFromCart;

  const updateQuantity = async (id: number, quantity: number) => {
    const currentToken = TokenManager.getToken();
    if (!currentToken) return;
    try {
      // SỬA: Thay 'cart-item' bằng 'cart' để khớp với apiResource
      await axios.put(
        `http://localhost:8000/api/cart/${id}`,
        {
          quantity,
        },
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
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
