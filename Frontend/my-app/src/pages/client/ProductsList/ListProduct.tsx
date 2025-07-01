<<<<<<< HEAD
import { useEffect } from "react";
import { FilteProducts } from "./FilteProducts";
import { BoxProduct } from "../../../components/BoxProduct";
import "../../../assets/styles/ListProducts.css";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Pagination } from "./Pagination";
import { useProductList } from "../../../hook/useProductList";
import { useLocation } from "react-router-dom";
import { Section } from "../../../components/Section";
import { useProductFilter } from "../../../hook/useProductFilter";
import { Breadcrumb } from "../../../components/Breadcrumb";

// Số sản phẩm mỗi trang: 3 hàng x 5 sản phẩm = 15
const PAGE_SIZE = 15;
/**
 * Trang danh sách sản phẩm với phân trang và bộ lọc
 */
export const ListProduct = () => {
  // Lấy danh sách sản phẩm phân trang qua custom hook
  const { products, categories, colors, sizes, loading, error } =
    useProductList(1, PAGE_SIZE);

  // Sử dụng custom hook filter mới
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

  // Lấy categoryId từ query string (nếu có)
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const hasCategory = params.has("category");

  // Tự động lọc lại khi filter.categories thay đổi (ví dụ khi click menu)
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
      <Navbar />
      {/* bộ lọc sp (offcanvas) */}
      <div
        className="offcanvas offcanvas-start border-end"
        data-bs-scroll="true"
        data-bs-backdrop="false"
        tabIndex={-1}
        id="offcanvasFilter"
      >
        <FilteProducts
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
      {/* Breadcrumb chỉ hiện khi có category */}
      {hasCategory && (
        <div className="container breadcrumb-container-list">
          <Breadcrumb
            items={[
              { label: "Trang chủ", to: "/" },
              { label: "Sản phẩm", to: "/products" },
              ...((filter.categories ?? []).length > 0 && categories.length > 0
                ? (() => {
                    const cat = categories.find(
                      (cat) => cat.id === (filter.categories ?? [])[0],
                    );
                    return cat && cat.name ? [{ label: cat.name }] : [];
                  })()
                : []),
            ]}
          />
        </div>
      )}
      {/* Đã gỡ bỏ Breadcrumb dưới Section */}
      {/* Thanh tìm kiếm và nút lọc ngang hàng  */}
      <div className="container my-4 product-list-container">
        {/* Hiển thị lỗi hoặc loading nếu có */}
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div>Đang tải sản phẩm...</div>
        ) : (
          <>
            <div className="product-section-container">
              {/* Nút Bộ lọc chuyển lên trên dãy sản phẩm */}
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
            {/* phân trang sp */}
            <Pagination
              currentPage={currentPage}
              totalPages={pageCount}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
      <Footer />
    </>
  );
};
=======

import { FilteProducts } from "./FilteProducts";
import { SerchProducts } from "./SerchProducts";
import { BoxProduc } from "../../../components/BoxProduc";
import '../../../assets/styles/ListProducts.css';
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Pagination } from "./Pagination";

export const ListProduct = () => {
  // Mẫu danh sách sản phẩm (có thể thay bằng props hoặc fetch API)
  const products = Array(30).fill({}); // tạo 12 sản phẩm mẫu

    return (
    <>
    <Navbar/>
    {/* bộ lọc sp */}
     <div className="offcanvas offcanvas-start border-end" data-bs-scroll="true" data-bs-backdrop="false" tabIndex={-1}  id="offcanvasFilter">
      <FilteProducts/>
     </div>
      {/* Thanh tìm kiếm và nút lọc ngang hàng  */}
  <div className="container my-4">
    {/* bộ lọc - tìm kiếm sp */}
       <SerchProducts />
    <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-4">
      {products.map((_, index) => (
            <BoxProduc key={index} />
          ))}
          {/* phân trang sp */}
          <Pagination/>
    </div>
  </div>
  <Footer/>
    </>
  )
};
>>>>>>> a8244187 (giao dien list sp)
