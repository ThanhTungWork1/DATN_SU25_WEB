import { useQuery } from "@tanstack/react-query";
import { getProductDetail, getAllProducts } from "../api/ApiProduct";
import type { Product } from "../types/DetailType";

export const useProductDetail = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductDetail(id),
    enabled: !!id,
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
      const allProducts = (await getAllProducts()) as Product[];
      const currentId = parseInt(currentProductId);

      // 1. Loại trừ sản phẩm hiện tại
      let filteredProducts = allProducts.filter(
        (product: Product) => product.id !== currentId
      );

      // 2. Lọc theo category
      let relatedProducts = categoryId
        ? filteredProducts.filter(
            (product: Product) =>
              Number(product.category_id) === Number(categoryId)
          )
        : filteredProducts;

      // 3. Trả về giới hạn sản phẩm
      return relatedProducts.slice(0, limit);
    },
    enabled: !!currentProductId && !!categoryId,
  });
};
