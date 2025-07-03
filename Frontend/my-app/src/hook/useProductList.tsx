import { useEffect, useState } from "react";
import {
  getAllProducts,
  getAllCategories,
  getAllColors,
  getAllSizes,
} from "../api/ApiProduct";
import type { Product } from "../types/ProductType";

export const useProductList = (
  page: number,
  limit: number,
  search?: string
) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [colors, setColors] = useState<{ id: number; name: string; code: string }[]>([]);
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
        const categoryMap: Record<number, string> = {};
        categoryRes.forEach((cat) => {
          categoryMap[cat.id] = cat.name;
        });

        let mappedProducts = (productsData as Product[]).map((p: any) => ({
          ...p,
          categoryName: categoryMap[p.category_id] || "",
        }));

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
  }, [page, limit, search]);

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
