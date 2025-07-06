import { useState, useEffect } from "react";
import { FilterProducts } from "./FilterProducts";
import { BoxProduct } from "../../../components/BoxProduct";
import { Pagination } from "./Pagination";
import { useProductPagination } from "../../../hook/useProductList";
import { useLocation } from "react-router-dom";
import { Section } from "../../../components/Section";
import { Breadcrumb } from "../../../components/Breadcrumb";
import { getAllCategories, getAllColors, getAllSizes } from "../../../api/ApiProduct";

const PAGE_SIZE = 15;

/**
 * Trang danh sách sản phẩm với phân trang và bộ lọc
 */
export const ListProduct = () => {
  // State filter và page
  const [filter, setFilter] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);

  // State cho categories, colors, sizes
  const [categories, setCategories] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);

  useEffect(() => {
    getAllCategories().then(setCategories);
    getAllColors().then(setColors);
    getAllSizes().then(setSizes);
  }, []);

  // Params truyền vào hook
  const params = {
    page: currentPage,
    per_page: PAGE_SIZE,
    ...filter,
  };

  // Lấy sản phẩm từ backend
  const { products, pagination, loading, error } = useProductPagination(params);

  // Lấy category từ query string (nếu cần cho breadcrumb)
  const location = useLocation();
  const paramsUrl = new URLSearchParams(location.search);
  const hasCategory = paramsUrl.has("category");
  const categoryFromUrl = paramsUrl.get("category");

  // Đồng bộ filter.category_id với URL param
  useEffect(() => {
    if (categoryFromUrl) {
      setFilter((prev: any) => ({
        ...prev,
        category_id: Number(categoryFromUrl)
      }));
    } else {
      setFilter((prev: any) => {
        const { category_id, ...rest } = prev;
        return rest;
      });
    }
    setCurrentPage(1);
  }, [categoryFromUrl]);

  // Hàm apply filter
  const applyFilter = () => {
    setCurrentPage(1);
  };

  // Hàm clear filter
  const clearFilter = () => {
    setFilter({});
    setCurrentPage(1);
  };

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
        <FilterProducts
          filter={filter}
          setFilter={setFilter}
          onApply={applyFilter}
          onClear={clearFilter}
          categories={categories}
          colors={colors}
          sizes={sizes}
        />
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
      <div className="container my-4 product-list-container">
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div>Đang tải sản phẩm...</div>
        ) : (
          <>
            <div className="product-section-container">
              <div className="d-flex align-items-center mb-3">
                <button
                  className="btn btn-filter"
                  type="button"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvasFilter"
                >
                  Bộ lọc
                </button>
              </div>
              <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-4">
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
