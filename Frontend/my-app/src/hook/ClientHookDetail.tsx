import { useQuery } from "@tanstack/react-query";
import { getProductDetail } from "../api/ApiProduct";
import type { Product } from "../types/DetailType";

/**
 * Hook lấy chi tiết sản phẩm theo ID từ backend thật.
 */
export const useProductDetail = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductDetail(id),
    enabled: !!id,
  });
};

/**
 * Hook lấy danh sách sản phẩm liên quan.
 * - Loại trừ sản phẩm hiện tại.
 * - Lọc theo `category_id`.
 * - Giới hạn số lượng kết quả trả về.
 */
export const useRelatedProducts = (
  currentProductId: string,
  categoryId?: number,
  limit: number = 4
) => {
  return useQuery({
    queryKey: ["related-products", currentProductId, categoryId],
    queryFn: async () => {
      const allProducts = await getAllProducts();
      const currentId = parseInt(currentProductId);

      // 1. Loại trừ sản phẩm hiện tại
      let filteredProducts = allProducts.filter(
        (product: Product) => product.id !== currentId
      );

      // 2. Lọc theo category
      let relatedProducts = categoryId
        ? filteredProducts.filter(
            (product: Product) => product.category_id === categoryId
          )
        : filteredProducts;

      // 3. Trả về giới hạn sản phẩm
      return relatedProducts.slice(0, limit);
    },
    enabled: !!currentProductId && !!categoryId,
  });
};
