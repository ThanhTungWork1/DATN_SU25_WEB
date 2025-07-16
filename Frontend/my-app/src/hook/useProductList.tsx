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

  return { products, pagination, loading, error };
};