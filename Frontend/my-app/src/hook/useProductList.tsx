import { useEffect, useState } from "react";
import { getProductsPaginatedAndFiltered } from "../api/ApiProduct";

export const useProductPagination = (params: any) => {
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const startTime = performance.now();
        const res = await getProductsPaginatedAndFiltered(params);
        const endTime = performance.now();

        console.log(
          `🚀 API Response Time: ${(endTime - startTime).toFixed(2)}ms`
        );

        const result = res as { data: any[]; pagination: any };
        setProducts(result.data || []);
        setPagination(
          result.pagination || {
            current_page: 1,
            per_page: 15,
            total: 0,
            total_pages: 1,
          }
        );

        // Chỉ hiển thị loading lần đầu
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      } catch (err: any) {
        console.error("❌ API Error:", err);
        setError("Lỗi khi tải dữ liệu: " + (err?.message || ""));
        setProducts([]);
        setPagination({
          current_page: 1,
          per_page: 15,
          total: 0,
          total_pages: 1,
        });
      } finally {
        setLoading(false);
      }
    };

    // Debounce để tránh gọi API quá nhiều
    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [JSON.stringify(params)]);

  return { products, pagination, loading, error, isInitialLoad };
};
