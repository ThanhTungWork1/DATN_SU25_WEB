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
    categoryId?: number,
    limit: number = 4
) => {
    return useQuery({
        queryKey: ['related-products', currentProductId, categoryId],
        queryFn: async () => {
            const allProducts = await getAllProducts();
            const currentId = parseInt(currentProductId);
            /* 1. Loại trừ sản phẩm hiện tại */
            let filteredProducts = allProducts.filter((product: Product) => product.id !== currentId);

            /* 2. Lọc sản phẩm cùng category_id */
            let relatedProducts: Product[] = [];
            if (categoryId) {
                relatedProducts = filteredProducts.filter((product: Product) =>
                    product.category_id === categoryId
                );
            }

            /* 3. Giới hạn số lượng sản phẩm liên quan */
            return relatedProducts.slice(0, limit);
        },
        enabled: !!currentProductId && !!categoryId,
    });
};

>>>>>>> f51a0d77 (trang detail hoan thien)
