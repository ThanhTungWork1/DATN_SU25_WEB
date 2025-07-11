import { useState, useEffect, useCallback, useMemo } from "react";
import { FilterProducts } from "./FilterProducts";
import { BoxProduct } from "../../../components/BoxProduct";
import { Pagination } from "./Pagination";
import { useLocation } from "react-router-dom";
import { Section } from "../../../components/Section";
import { Breadcrumb } from "../../../components/Breadcrumb";
import {
  getAllCategories,
  getAllColors,
  getAllSizes,
  getProductsPaginatedAndFiltered,
} from "../../../api/ApiProduct";
import { SkeletonProduct } from "../../../components/SkeletonProduct";

const PAGE_SIZE = 15;

/**
 * Trang danh sách sản phẩm với phân trang và bộ lọc
 */
export const ListProduct = () => {
  // State filter và page
  const [filter, setFilter] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);

  // State cho categories, colors, sizes
  const [categories, setCategories] = useState<any[]>(() => {
    const cached = localStorage.getItem("categories");
    return cached ? JSON.parse(cached) : [];
  });
  const [colors, setColors] = useState<any[]>(() => {
    const cached = localStorage.getItem("colors");
    return cached ? JSON.parse(cached) : [];
  });
  const [sizes, setSizes] = useState<any[]>(() => {
    const cached = localStorage.getItem("sizes");
    return cached ? JSON.parse(cached) : [];
  });

  const [products, setProducts] = useState<any[]>(() => {
    const cached = localStorage.getItem(`products_page_${1}`);
    return cached ? JSON.parse(cached) : [];
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: PAGE_SIZE,
    total: 0,
    total_pages: 1,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(products.length === 0);

  const [loadingCategories, setLoadingCategories] = useState(
    categories.length === 0
  );
  const [loadingColors, setLoadingColors] = useState(colors.length === 0);
  const [loadingSizes, setLoadingSizes] = useState(sizes.length === 0);

  useEffect(() => {
    getAllCategories().then((data) => {
      setCategories(data);
      localStorage.setItem("categories", JSON.stringify(data));
      setLoadingCategories(false);
    });
    getAllColors().then((colors) => {
      setColors(
        colors.map((c: any) => ({
          ...c,
          code: c.hex_code,
        }))
      );
      localStorage.setItem("colors", JSON.stringify(colors));
      setLoadingColors(false);
    });
    getAllSizes().then((data) => {
      setSizes(data);
      localStorage.setItem("sizes", JSON.stringify(data));
      setLoadingSizes(false);
    });
  }, []);

  // Params truyền vào hook
  const params = {
    page: currentPage,
    per_page: PAGE_SIZE,
    ...filter,
  };

  // Lấy sản phẩm từ backend
  useEffect(() => {
    setLoading(products.length === 0);
    setError(null);
    getProductsPaginatedAndFiltered(params)
      .then((res) => {
        const result = res as ProductApiResponse;
        setProducts(result.data);
        setPagination(
          result.pagination || {
            current_page: 1,
            per_page: PAGE_SIZE,
            total: 0,
            total_pages: 1,
          }
        );
        localStorage.setItem(
          `products_page_${params.page || 1}`,
          JSON.stringify(result.data)
        );
        setLoading(false);
      })
      .catch((err) => {
        setError("Lỗi khi tải dữ liệu: " + (err?.message || ""));
        setProducts([]);
        setPagination({
          current_page: 1,
          per_page: PAGE_SIZE,
          total: 0,
          total_pages: 1,
        });
        setLoading(false);
      });
  }, [JSON.stringify(params)]);

  // Lấy category từ query string (nếu cần cho breadcrumb)
  const location = useLocation();
  const paramsUrl = new URLSearchParams(location.search);
  const hasCategory = paramsUrl.has("category");
  const categoryFromUrl = paramsUrl.get("category");
  const isOnlyProductsPage = location.pathname === "/products" && !paramsUrl.has("category");

  // Đồng bộ filter.category_id với URL param
  useEffect(() => {
    if (categoryFromUrl) {
      setFilter((prev: any) => ({
        ...prev,
        category_id: Number(categoryFromUrl),
      }));
    } else {
      setFilter((prev: any) => {
        const { category_id, ...rest } = prev;
        return rest;
      });
    }
    setCurrentPage(1);
  }, [categoryFromUrl]);

  const applyFilter = useCallback(() => {
    setCurrentPage(1);
  }, [filter]);

  const clearFilter = useCallback(() => {
    setFilter({});
    setCurrentPage(1);
  }, []);

  const memoizedFilterProducts = useMemo(
    () => (
      <FilterProducts
        filter={filter}
        setFilter={setFilter}
        onApply={applyFilter}
        onClear={clearFilter}
        categories={categories}
        colors={colors}
        sizes={sizes}
        loadingCategories={loadingCategories}
        loadingColors={loadingColors}
        loadingSizes={loadingSizes}
      />
    ),
    [
      filter,
      setFilter,
      applyFilter,
      clearFilter,
      categories,
      colors,
      sizes,
      loadingCategories,
      loadingColors,
      loadingSizes,
    ]
  );

  return (
    <>
      {/* Bộ lọc offcanvas */}
      <div
        className="offcanvas offcanvas-start border-end"
        data-bs-scroll="true"
        data-bs-backdrop="false"
        tabIndex={-1}
        id="offcanvasFilter"
      >
        {memoizedFilterProducts}
      </div>

      <Section />

      {/* Breadcrumb */}
      {hasCategory && (
        <div className="container breadcrumb-container-list">
          <Breadcrumb
            items={[
              { label: "Trang chủ", to: "/" },
              { label: "Sản phẩm", to: "/products" },
            ]}
          />
        </div>
      )}

      {/* Nội dung chính */}
      <div className="product-list-container">
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-4">
            {[...Array(PAGE_SIZE)].map((_, i) => (
              <div className="col" key={i}>
                <SkeletonProduct />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="product-section-container">
              <div className="d-flex align-items-center mb-3">
                {isOnlyProductsPage && (
                  <button
                    className="btn btn-filter"
                    type="button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasFilter"
                  >
                    Bộ lọc
                  </button>
                )}
              </div>
              <div className="product-grid">
                {products.map((product: any) => (
                  <BoxProduct key={product.id} product={product} />
                ))}
              </div>
            </div>

            {/* Phân trang */}
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.total_pages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </>
  );
};

type ProductApiResponse = {
  data: any[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
    [key: string]: any;
  };
  [key: string]: any;
};
