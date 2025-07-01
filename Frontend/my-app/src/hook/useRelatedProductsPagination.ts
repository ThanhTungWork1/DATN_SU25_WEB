import React, { useState, useMemo } from "react";

/**
 * Custom hook phân trang cho danh sách sản phẩm liên quan
 * @param products Mảng sản phẩm
 * @param pageSize Số sản phẩm mỗi trang
 */
export function useRelatedProductsPagination<T>(
  products: T[],
  pageSize: number,
) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(products.length / pageSize);

  const paginatedProducts = useMemo(() => {
    const start = page * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, page, pageSize]);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  const goPrev = () => {
    if (canPrev) setPage((p) => p - 1);
  };
  const goNext = () => {
    if (canNext) setPage((p) => p + 1);
  };

  // Reset về trang đầu nếu mảng sản phẩm thay đổi
  // (tránh lỗi khi đổi sản phẩm chính)
  React.useEffect(() => {
    setPage(0);
  }, [products]);

  return { paginatedProducts, canPrev, canNext, goPrev, goNext };
}
