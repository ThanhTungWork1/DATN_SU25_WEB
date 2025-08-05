import { useQuery } from "@tanstack/react-query";
import { getProductDetail, getAllProducts } from "../api/ApiProduct";
import type { Product } from "../types/DetailType";

export const useProductDetail = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const result = await getProductDetail(id);
      return result;
    },
    enabled: !!id,
    staleTime: 0, // Force refetch every time
    cacheTime: 0, // Don't cache
  });
};

export const useRelatedProducts = (
  currentProductId: string,
  categoryId?: number,
  limit: number = 4
) => {
  return useQuery({
    queryKey: ["related-products", currentProductId, categoryId],
    queryFn: async () => {
      try {
        const allProducts = (await getAllProducts()) as Product[];

        if (!Array.isArray(allProducts)) {
          console.error(
            "🔍 [useRelatedProducts DEBUG] allProducts is not an array:",
            allProducts
          );
          throw new Error("allProducts is not an array");
        }

        const currentId = parseInt(currentProductId);

        // 1. Loại trừ sản phẩm hiện tại

        let filteredProducts = allProducts.filter((product: Product) => {
          const shouldExclude = product.id !== currentId;
          return shouldExclude;
        });

        // Tạm thời bỏ lọc category để test
        let relatedProducts = filteredProducts;

        // Code gốc (comment lại để test):
        /*
        let relatedProducts = categoryId
          ? filteredProducts.filter(
              (product: Product) => {
                const matches = Number(product.category_id) === Number(categoryId);
                return matches;
              }
            )
          : filteredProducts;
        */

        // 3. Trả về giới hạn sản phẩm
        const result = relatedProducts.slice(0, limit);
        return result;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!currentProductId, // Tạm thời bỏ điều kiện categoryId để test
  });
};
