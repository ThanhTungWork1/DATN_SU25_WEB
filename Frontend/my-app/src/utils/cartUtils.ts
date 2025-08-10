import axios from "axios";
import { TokenManager } from "./tokenUtils";

/**
 * Clear all items from user's cart via API
 */
export const clearCartAPI = async () => {
  const token = TokenManager.getUserToken();
  
  if (!token) {
    throw new Error("Bạn cần đăng nhập để thực hiện thao tác này");
  }

  try {
    const response = await axios.delete(
      "http://localhost:8000/api/cart",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error("Lỗi khi xóa giỏ hàng:", error);
    throw new Error(error.response?.data?.message || "Lỗi khi xóa giỏ hàng!");
  }
};

/**
 * Clear cart from localStorage (for local cart system)
 */
export const clearLocalCart = () => {
  localStorage.removeItem('cartItems');
  localStorage.removeItem('cart');
  localStorage.removeItem('selectedCartItems');
};

/**
 * Clear both API cart and local cart
 */
export const clearAllCarts = async () => {
  try {
    // Clear API cart
    await clearCartAPI();
  } catch (error) {
    console.warn("Could not clear API cart:", error);
  }
  
  // Always clear local cart
  clearLocalCart();
};

