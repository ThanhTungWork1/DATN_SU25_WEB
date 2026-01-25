import axios from "axios";
import { TokenManager } from "../utils/tokenUtils";

const API_BASE_URL = "http://localhost:8000/api";

// Lấy danh sách sản phẩm yêu thích của user
export const getFavorites = async () => {
  const token = TokenManager.getUserToken();
  if (!token) {
    throw new Error("Bạn cần đăng nhập để xem danh sách yêu thích");
  }

  const response = await axios.get(`${API_BASE_URL}/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Thêm sản phẩm vào yêu thích
export const addToFavorites = async (productId: number) => {
  const token = TokenManager.getUserToken();
  if (!token) {
    throw new Error("Bạn cần đăng nhập để thêm vào yêu thích");
  }

  const response = await axios.post(
    `${API_BASE_URL}/favorites/add`,
    { product_id: productId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Xóa sản phẩm khỏi yêu thích
export const removeFromFavorites = async (productId: number) => {
  const token = TokenManager.getUserToken();
  if (!token) {
    throw new Error("Bạn cần đăng nhập để xóa khỏi yêu thích");
  }

  const response = await axios.delete(
    `${API_BASE_URL}/favorites/${productId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// Toggle yêu thích (thêm nếu chưa có, xóa nếu đã có)
export const toggleFavorite = async (productId: number) => {
  const token = TokenManager.getUserToken();
  if (!token) {
    throw new Error("Bạn cần đăng nhập để thêm vào yêu thích");
  }

  const response = await axios.post(
    `${API_BASE_URL}/favorites/${productId}/toggle`,
    { product_id: productId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Kiểm tra sản phẩm có trong yêu thích không
export const checkFavorite = async (productId: number) => {
  const token = TokenManager.getUserToken();
  if (!token) {
    return { is_favorited: false };
  }

  try {
    const response = await axios.get(
      `${API_BASE_URL}/favorites/${productId}/check`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    return { is_favorited: false };
  }
};
