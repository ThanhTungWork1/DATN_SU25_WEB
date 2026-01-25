import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { toast } from "sonner";
import { TokenManager } from "../utils/tokenUtils";
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  checkFavorite,
} from "../api/ApiFavorite";
import {
  migrateWishlistToFavorites,
  shouldMigrateWishlist,
} from "../utils/favoriteMigration";

interface FavoriteContextType {
  favorites: any[];
  favoriteIds: number[];
  addToFavorite: (productId: number) => Promise<void>;
  removeFromFavorite: (productId: number) => Promise<void>;
  toggleFavorite: (productId: number) => Promise<void>;
  isInFavorite: (productId: number) => boolean;
  clearFavorites: () => void;
  loading: boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(
  undefined
);

export const FavoriteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách favorites từ server
  const fetchFavorites = useCallback(async () => {
    const token = TokenManager.getUserToken();
    if (!token) {
      setFavorites([]);
      setFavoriteIds([]);
      return;
    }

    try {
      setLoading(true);

      // Kiểm tra và migrate dữ liệu từ localStorage nếu cần
      if (shouldMigrateWishlist()) {
        console.log("🔄 Phát hiện dữ liệu localStorage, bắt đầu migrate...");
        await migrateWishlistToFavorites();
      }

      const response = await getFavorites();
      const favoritesData = response.data || [];
      setFavorites(favoritesData);
      setFavoriteIds(favoritesData.map((fav: any) => fav.id));
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách yêu thích:", error);
      toast.error("Không thể tải danh sách yêu thích");
      setFavorites([]);
      setFavoriteIds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Thêm vào yêu thích
  const addToFavorite = useCallback(
    async (productId: number) => {
      const token = TokenManager.getUserToken();
      if (!token) {
        toast.error("Vui lòng đăng nhập để thêm vào yêu thích");
        return;
      }

      try {
        await addToFavorites(productId);
        await fetchFavorites(); // Refresh danh sách
        toast.success("Đã thêm vào yêu thích");
      } catch (error: any) {
        console.error("Lỗi khi thêm vào yêu thích:", error);
        toast.error(error.message || "Không thể thêm vào yêu thích");
      }
    },
    [fetchFavorites]
  );

  // Xóa khỏi yêu thích
  const removeFromFavorite = useCallback(
    async (productId: number) => {
      const token = TokenManager.getUserToken();
      if (!token) {
        toast.error("Vui lòng đăng nhập để xóa khỏi yêu thích");
        return;
      }

      try {
        await removeFromFavorites(productId);
        await fetchFavorites(); // Refresh danh sách
        toast.success("Đã xóa khỏi yêu thích");
      } catch (error: any) {
        console.error("Lỗi khi xóa khỏi yêu thích:", error);
        toast.error(error.message || "Không thể xóa khỏi yêu thích");
      }
    },
    [fetchFavorites]
  );

  // Toggle yêu thích
  const toggleFavoriteHandler = useCallback(
    async (productId: number) => {
      const token = TokenManager.getUserToken();
      if (!token) {
        toast.error("Vui lòng đăng nhập để thêm vào yêu thích");
        return;
      }

      try {
        const response = await toggleFavorite(productId);
        await fetchFavorites(); // Refresh danh sách
        toast.success(response.message);
      } catch (error: any) {
        console.error("Lỗi khi toggle yêu thích:", error);
        toast.error(error.message || "Không thể thay đổi trạng thái yêu thích");
      }
    },
    [fetchFavorites]
  );

  // Kiểm tra sản phẩm có trong yêu thích không
  const isInFavorite = useCallback(
    (productId: number) => {
      return favoriteIds.includes(productId);
    },
    [favoriteIds]
  );

  // Xóa toàn bộ yêu thích
  const clearFavorites = useCallback(() => {
    setFavorites([]);
    setFavoriteIds([]);
  }, []);

  // Refresh danh sách favorites
  const refreshFavorites = useCallback(async () => {
    await fetchFavorites();
  }, [fetchFavorites]);

  // Lắng nghe thay đổi token để refresh favorites
  useEffect(() => {
    const handleTokenChange = () => {
      fetchFavorites();
    };

    // Kiểm tra ngay lúc đầu
    handleTokenChange();

    // Lắng nghe sự kiện thay đổi token
    window.addEventListener("storage", handleTokenChange);
    window.addEventListener("token-changed", handleTokenChange);

    return () => {
      window.removeEventListener("storage", handleTokenChange);
      window.removeEventListener("token-changed", handleTokenChange);
    };
  }, [fetchFavorites]);

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        favoriteIds,
        addToFavorite,
        removeFromFavorite,
        toggleFavorite: toggleFavoriteHandler,
        isInFavorite,
        clearFavorites,
        loading,
        refreshFavorites,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
};

export function useFavoriteContext() {
  const ctx = useContext(FavoriteContext);
  if (!ctx)
    throw new Error(
      "useFavoriteContext must be used within a FavoriteProvider"
    );
  return ctx;
}
