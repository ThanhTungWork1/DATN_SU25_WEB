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
  console.log('🔍 [useRelatedProducts DEBUG] Hook called with:', { currentProductId, categoryId, limit });
  console.log('🔍 [useRelatedProducts DEBUG] enabled condition:', !!currentProductId);
  
  return useQuery({
    queryKey: ["related-products", currentProductId, categoryId],
    queryFn: async () => {
      try {
        console.log('🔍 [useRelatedProducts DEBUG] Starting query...');
        console.log('🔍 [useRelatedProducts DEBUG] currentProductId:', currentProductId);
        console.log('🔍 [useRelatedProducts DEBUG] categoryId:', categoryId);
        
        const allProducts = (await getAllProducts()) as Product[];
        console.log('🔍 [useRelatedProducts DEBUG] allProducts:', allProducts);
        
        if (!Array.isArray(allProducts)) {
          console.error('🔍 [useRelatedProducts DEBUG] allProducts is not an array:', allProducts);
          throw new Error('allProducts is not an array');
        }
        
        const currentId = parseInt(currentProductId);
        console.log('🔍 [useRelatedProducts DEBUG] currentId:', currentId);

        // 1. Loại trừ sản phẩm hiện tại
        console.log('🔍 [useRelatedProducts DEBUG] All products before filtering:', allProducts.map(p => ({ id: p.id, name: p.name })));
        
        let filteredProducts = allProducts.filter(
          (product: Product) => {
            const shouldExclude = product.id !== currentId;
            console.log('🔍 [useRelatedProducts DEBUG] Product', product.id, 'should exclude:', shouldExclude);
            return shouldExclude;
          }
        );
        console.log('🔍 [useRelatedProducts DEBUG] filteredProducts (after exclude current):', filteredProducts);

        // 2. Lọc theo category (TẠM THỜI BỎ ĐIỀU KIỆN ĐỂ TEST)
        console.log('🔍 [useRelatedProducts DEBUG] Checking category filter...');
        console.log('🔍 [useRelatedProducts DEBUG] categoryId type:', typeof categoryId, 'value:', categoryId);
        
        // Tạm thời bỏ lọc category để test
        let relatedProducts = filteredProducts;
        console.log('🔍 [useRelatedProducts DEBUG] Bỏ lọc category, lấy tất cả sản phẩm');
        
        // Code gốc (comment lại để test):
        /*
        let relatedProducts = categoryId
          ? filteredProducts.filter(
              (product: Product) => {
                console.log('🔍 [useRelatedProducts DEBUG] Product:', product.id, 'category_id:', product.category_id, 'type:', typeof product.category_id);
                const matches = Number(product.category_id) === Number(categoryId);
                console.log('🔍 [useRelatedProducts DEBUG] Matches:', matches);
                return matches;
              }
            )
          : filteredProducts;
        */
        console.log('🔍 [useRelatedProducts DEBUG] relatedProducts (after category filter):', relatedProducts);

        // 3. Trả về giới hạn sản phẩm
        const result = relatedProducts.slice(0, limit);
        console.log('🔍 [useRelatedProducts DEBUG] final result:', result);
        return result;
      } catch (error) {
        console.error('🔍 [useRelatedProducts DEBUG] Error in queryFn:', error);
        throw error;
      }
    },
    enabled: !!currentProductId, // Tạm thời bỏ điều kiện categoryId để test
  });
};
