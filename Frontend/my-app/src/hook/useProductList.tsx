import { useEffect, useState } from "react";
import { getProductsPaginatedAndFiltered } from "../api/ApiProduct";

export const useProductPagination = (params: any) => {
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ current_page: 1, per_page: 15, total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
<<<<<<< HEAD
    getProductsPaginatedAndFiltered(params)
      .then((res) => {
        const result = res as { data: any[]; pagination: any };
        setProducts(result.data || []);
        setPagination(result.pagination || { current_page: 1, per_page: 15, total: 0, total_pages: 1 });
      })
      .catch((err) => {
        setError("Lỗi khi tải dữ liệu: " + (err?.message || ""));
        setProducts([]);
        setPagination({ current_page: 1, per_page: 15, total: 0, total_pages: 1 });
      })
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);
=======
    Promise.all([
      getAllProducts(),
      getAllCategories(),
      getAllColors(),
      getAllSizes(),
    ])
      .then(([productsData, categoryRes, colorRes, sizeRes]) => {
        // Map categoryName cho từng sản phẩm
        const categoryMap: Record<number, string> = {};
        categoryRes.forEach((cat) => {
          categoryMap[cat.id] = cat.name;
        });
        let mappedProducts = (productsData as Product[]).map((p: any) => ({
          ...p,
          categoryName: categoryMap[p.category_id] || "",
        }));
        // Lọc theo search nếu có
        if (search && search.trim()) {
          const lowerSearch = search.trim().toLowerCase();
          mappedProducts = mappedProducts.filter((p: Product) =>
            p.name?.toLowerCase().includes(lowerSearch)
          );
        }
        setProducts(mappedProducts);
        setCategories(categoryRes);
        setColors(colorRes as { id: number; name: string; code: string }[]);
        setSizes(sizeRes as { id: number; name: string }[]);
        setTotal(mappedProducts.length);
        setTotalPages(Math.ceil(mappedProducts.length / limit));
      })
      .finally(() => setLoading(false));
  }, [search]);
>>>>>>> bc9cc18e (spa lai giao dien va cac file code, nang cap serch,filte)

  return { products, pagination, loading, error };
};
