import { useEffect } from "react";
import { FilterProducts } from "./FilterProducts";
import { BoxProduct } from "../../../components/BoxProduct";
import "../../../assets/styles/ListProducts.css";
import { Pagination } from "./Pagination";
import { useProductList } from "../../../hook/useProductList";
import { useLocation } from "react-router-dom";
import { Section } from "../../../components/Section";
import { useProductFilter } from "../../../hook/useProductFilter";
import { Breadcrumb } from "../../../components/Breadcrumb";

// Số sản phẩm mỗi trang
const PAGE_SIZE = 15;

/**
 * Trang danh sách sản phẩm với phân trang và bộ lọc
 */
export const ListProduct = () => {
  // Fetch dữ liệu sản phẩm + danh mục
  const { products, categories, colors, sizes, loading, error } =
    useProductList(1, PAGE_SIZE);

  // Filter hook
  const {
    currentPage,
    setCurrentPage,
    filter,
    setFilter,
    applyFilter,
    clearFilter,
    pagedProducts,
    pageCount,
    isCategoryMenu,
  } = useProductFilter(products, PAGE_SIZE);

  // Lấy category từ query string
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const hasCategory = params.has("category");

  // Tự động lọc khi filter thay đổi
  useEffect(() => {
    const hasFilter =
      (filter.categories && filter.categories.length > 0) ||
      filter.name ||
      filter.priceRange ||
      (filter.colors && filter.colors.length > 0) ||
      (filter.sizes && filter.sizes.length > 0) ||
      (filter.materials && filter.materials.length > 0);

    if (hasFilter) {
      applyFilter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter.categories,
    filter.name,
    filter.priceRange,
    filter.colors,
    filter.sizes,
    filter.materials,
  ]);

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
              ...((filter.categories ?? []).length > 0 && categories.length > 0
                ? (() => {
                    const cat = categories.find(
                      (cat) => cat.id === (filter.categories ?? [])[0]
                    );
                    return cat && cat.name ? [{ label: cat.name }] : [];
                  })()
                : []),
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
              {!isCategoryMenu && (
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
              )}
              <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-4">
                {pagedProducts.map((product) => (
                  <BoxProduct key={product.id} product={product} />
                ))}
              </div>
            </div>

            {/* Phân trang */}
            <Pagination
              currentPage={currentPage}
              totalPages={pageCount}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </>
  );
};
