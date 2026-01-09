import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const WISHLIST_KEY = "wishlist_product_ids";

interface WishlistContextType {
  wishlist: string[];
  addToWishlist: (productId: number | string) => void;
  removeFromWishlist: (productId: number | string) => void;
  isInWishlist: (productId: number | string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load từ localStorage khi mount
  useEffect(() => {
    const stored = localStorage.getItem(WISHLIST_KEY);
    setWishlist(stored ? JSON.parse(stored) : []);
    setLoading(false);

    // Lắng nghe sự kiện storage để đồng bộ giữa các tab
    const handleStorage = (e: StorageEvent) => {
      if (e.key === WISHLIST_KEY) {
        setWishlist(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Chỉ lưu vào localStorage khi đã load xong dữ liệu (tránh ghi đè rỗng khi reload)
  useEffect(() => {
    if (loading) return;
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, loading]);

  const addToWishlist = useCallback((productId: number | string) => {
    setWishlist((prev) => {
      const idStr = String(productId);
      return prev.includes(idStr) ? prev : [...prev, idStr];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: number | string) => {
    setWishlist((prev) => prev.filter((id) => id !== String(productId)));
  }, []);

  const isInWishlist = useCallback((productId: number | string) => {
    return wishlist.includes(String(productId));
  }, [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  if (loading) return null; // hoặc return <div>Loading...</div>

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlistContext() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlistContext must be used within a WishlistProvider");
  return ctx;
} 