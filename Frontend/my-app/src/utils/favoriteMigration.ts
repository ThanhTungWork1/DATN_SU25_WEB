import { addToFavorites } from "../api/ApiFavorite";
import { TokenManager } from "./tokenUtils";

const WISHLIST_KEY = "wishlist_product_ids";

// Migrate dữ liệu từ localStorage sang database
export const migrateWishlistToFavorites = async () => {
  const token = TokenManager.getUserToken();
  if (!token) {
    return;
  }

  try {
    // Lấy danh sách wishlist từ localStorage
    const stored = localStorage.getItem(WISHLIST_KEY);
    if (!stored) {
      return;
    }

    const wishlistIds = JSON.parse(stored);
    if (!Array.isArray(wishlistIds) || wishlistIds.length === 0) {
      return;
    }

    console.log(
      "🔄 Bắt đầu migrate wishlist từ localStorage sang database:",
      wishlistIds
    );

    // Thêm từng sản phẩm vào favorites trong database
    const promises = wishlistIds.map(async (productId) => {
      try {
        await addToFavorites(Number(productId));
        console.log(`✅ Đã migrate sản phẩm ${productId}`);
      } catch (error) {
        console.log(`❌ Lỗi khi migrate sản phẩm ${productId}:`, error);
      }
    });

    await Promise.all(promises);

    // Xóa localStorage sau khi migrate thành công
    localStorage.removeItem(WISHLIST_KEY);
    console.log("✅ Đã xóa localStorage wishlist sau khi migrate thành công");
  } catch (error) {
    console.error("❌ Lỗi khi migrate wishlist:", error);
  }
};

// Kiểm tra xem có cần migrate không
export const shouldMigrateWishlist = (): boolean => {
  const stored = localStorage.getItem(WISHLIST_KEY);
  if (!stored) {
    return false;
  }

  try {
    const wishlistIds = JSON.parse(stored);
    return Array.isArray(wishlistIds) && wishlistIds.length > 0;
  } catch {
    return false;
  }
};
