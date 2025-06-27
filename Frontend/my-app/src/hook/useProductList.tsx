import { useEffect, useState } from "react";
import {
  getAllProducts,
  getAllCategories,
  getAllColors,
  getAllSizes,
} from "../api/ApiProduct";
import type { Product } from "../types/ProductType";

/**
 * Hook lấy danh sách sản phẩm có phân trang
 * @param page Trang hiện tại
 * @param limit Số sản phẩm mỗi trang
 * @param search Từ khóa tìm kiếm (tùy chọn)
 */
export const useProductList = (
  page: number,
  limit: number,
  search?: string,
) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [colors, setColors] = useState<
    { id: number; name: string; code: string }[]
  >([]);
  const [sizes, setSizes] = useState<{ id: number; name: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
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
        const mappedProducts = (productsData as Product[]).map((p: any) => ({
          ...p,
          categoryName: categoryMap[p.category_id] || "",
        }));
        setProducts(mappedProducts);
        setCategories(categoryRes);
        setColors(colorRes as { id: number; name: string; code: string }[]);
        setSizes(sizeRes as { id: number; name: string }[]);
        setTotal(mappedProducts.length);
        setTotalPages(Math.ceil(mappedProducts.length / limit));
      })
      .catch((error) => {
        setError("Không thể tải sản phẩm");
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    products,
    categories,
    colors,
    sizes,
    total,
    totalPages,
    loading,
    error,
  };
};
