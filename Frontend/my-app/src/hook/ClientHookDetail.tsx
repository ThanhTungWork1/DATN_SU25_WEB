<<<<<<< HEAD
import { useQuery } from "@tanstack/react-query";
import { getProductById, getAllProducts } from "../api/ApiUrl";
import type { Product } from "../types/DetailType";

// Hook này dùng để lấy dữ liệu chi tiết của một sản phẩm theo id (gọi API, quản lý loading/error, ...).
export const useProductDetail = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
};

// Hook này dùng để lấy danh sách sản phẩm liên quan (cùng category, loại trừ sản phẩm hiện tại, giới hạn số lượng, ...)
export const useRelatedProducts = (
  currentProductId: string,
  categoryId?: number,
  limit: number = 4,
) => {
  return useQuery({
    queryKey: ["related-products", currentProductId, categoryId],
    queryFn: async () => {
      const allProducts = await getAllProducts();
      const currentId = parseInt(currentProductId);
      /* 1. Loại trừ sản phẩm hiện tại */
      let filteredProducts = allProducts.filter(
        (product: Product) => product.id !== currentId,
      );

      /* 2. Lọc sản phẩm cùng category_id */
      let relatedProducts: Product[] = [];
      if (categoryId) {
        relatedProducts = filteredProducts.filter(
          (product: Product) => product.category_id === categoryId,
        );
      }

      /* 3. Giới hạn số lượng sản phẩm liên quan */
      return relatedProducts.slice(0, limit);
    },
    enabled: !!currentProductId && !!categoryId,
  });
};
=======
import { useQuery } from '@tanstack/react-query';
import { getProductById, getAllProducts } from '../api/ApiUrl';
import type { Product } from '../types/DetailType';

export const useProductDetail = (id: string) => {
    return useQuery({
        queryKey: ['product', id],
        queryFn: () => getProductById(id),
        enabled: !!id,
    });
};

export const useRelatedProducts = (
    currentProductId: string,
    categoryName?: string,
    tags?: string[],
    price?: number,
    limit: number = 4
) => {
    return useQuery({
        queryKey: ['related-products', currentProductId, categoryName, tags, price],
        queryFn: async () => {
            const allProducts = await getAllProducts();
            const currentId = parseInt(currentProductId);
            // 1. Loại trừ sản phẩm hiện tại
            let filteredProducts = allProducts.filter((product: Product) => product.id !== currentId);

            // 2. Ưu tiên sản phẩm cùng tag (mẫu)
            let tagRelated: Product[] = [];
            if (tags && tags.length > 0) {
                tagRelated = filteredProducts.filter((product: Product) =>
                    product.tags.some(tag => tags.includes(tag))
                );
            }

            // 3. Ưu tiên sản phẩm cùng category (nếu muốn giữ logic này)
            let categoryRelated: Product[] = [];
            if (categoryName) {
                categoryRelated = filteredProducts.filter((product: Product) =>
                    product.category === categoryName
                );
            }

            // 4. Sản phẩm còn lại (không trùng tag)
            let others = filteredProducts.filter((product: Product) =>
                !(tags && tags.length > 0 && product.tags.some(tag => tags.includes(tag)))
            );

            // 5. Sắp xếp theo giá gần nhất với sản phẩm hiện tại
            if (typeof price === 'number') {
                others = others.sort((a, b) => Math.abs(a.price - price) - Math.abs(b.price - price));
            }

            // 6. Kết hợp: tag trước, rồi category, rồi theo giá gần nhất, loại trùng lặp
            const seen = new Set<number>();
            const result: Product[] = [];
            for (const arr of [tagRelated, categoryRelated, others]) {
                for (const p of arr) {
                    if (!seen.has(p.id)) {
                        result.push(p);
                        seen.add(p.id);
                    }
                }
            }
            return result.slice(0, limit);
        },
        enabled: !!currentProductId,
    });
};

>>>>>>> f51a0d77 (trang detail hoan thien)
