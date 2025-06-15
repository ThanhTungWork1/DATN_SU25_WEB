<<<<<<< HEAD
import { useRelatedProducts } from "../../../hook/ClientHookDetail";
import { useParams } from "react-router-dom";
import "../../../assets/styles/detailProduct.css";
import { BoxProduct } from "../../../components/BoxProduct";
import { useRelatedProductsPagination } from "../../../hook/useRelatedProductsPagination";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { RouteParams, RelatedProductsProps } from "../../../types/RelatedProductsType";

// =============================
// Component hiển thị danh sách sản phẩm liên quan
// =============================

const RelatedProducts = ({ categoryId, limit = 8 }: RelatedProductsProps) => {
  // Lấy id sản phẩm hiện tại từ URL
  const { id } = useParams<RouteParams>();
  // Lấy danh sách sản phẩm liên quan từ hook (lọc theo categoryId)
  const {
    data: relatedProducts,
    isLoading,
    isError,
  } = useRelatedProducts(id!, categoryId, limit);

  const { paginatedProducts, canPrev, canNext, goPrev, goNext } =
    useRelatedProductsPagination(relatedProducts || [], 4);

  // Loading: hiển thị skeleton
  if (isLoading) {
    return (
      <div className="related-products mt-5">
        <h4 className="text-center mb-4">Sản phẩm liên quan</h4>
        <div className="row g-3">
          {[...Array(8)].map((_, index) => (
            <div className="col-lg-3 col-md-4 col-sm-6 col-12" key={index}>
              <div className="card h-100">
                <div
                  className="card-img-top bg-light"
                  style={{ height: "300px" }}
                ></div>
                <div className="card-body">
                  <div className="placeholder-glow">
                    <h6 className="placeholder col-8"></h6>
                    <p className="placeholder col-4"></p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Nếu lỗi hoặc không có sản phẩm liên quan
  if (isError || !relatedProducts || relatedProducts.length === 0) {
    return (
      <div className="related-products mt-5">
        <h4 className="text-center mb-4">Sản phẩm liên quan</h4>
        <p className="text-center text-muted">Không có sản phẩm liên quan</p>
      </div>
    );
  }

  // =============================
  // Render danh sách sản phẩm liên quan
  // =============================
  return (
    <div className="related-products-wrapper mt-5">
      <h4 className="text-center mb-4">Sản phẩm liên quan</h4>
      <div className="related-products-pagination">
        <button
          className="related-products-nav-btn left"
          onClick={goPrev}
          disabled={!canPrev}
          aria-label="Trước"
        >
          <FaChevronLeft />
        </button>
        <div className="related-products-flex">
          {paginatedProducts.map((product) => (
            <div className="related-product-item" key={product.id}>
              <BoxProduct
                product={{
                  ...product,
                  image:
                    product.image ||
                    (product.images && product.images[0]) ||
                    "",
                  colors: Array.isArray(product.colors)
                    ? product.colors.map((c: any) =>
                        typeof c === "object" && c.id ? c.id : c,
                      )
                    : product.colors,
                }}
              />
            </div>
          ))}
        </div>
        <button
          className="related-products-nav-btn right"
          onClick={goNext}
          disabled={!canNext}
          aria-label="Sau"
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
=======


const RelatedProducts = () => {
    return (
        <div className="related-products mt-5">
            <h4 className="text-center mb-4">Sản phẩm liên quan</h4>
            <div className="row g-3">
                <div className="col-md-3">
                    <div className="card">
                        <img src="https://tse4.mm.bing.net/th?id=OIP.7ZxepcJaDNoUZqs3JZPxKwHaHa&pid=Api&P=0&h=180/300x300" className="card-img-top" />
                        <div className="card-body">
                            <h6 className="card-title">Áo thun trơn</h6>
                            <p className="price">250.000đ</p>
                            <button className="btn btn-outline-dark btn-sm">Thêm giỏ hàng</button>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card">
                        <img src="https://tse4.mm.bing.net/th?id=OIP.7ZxepcJaDNoUZqs3JZPxKwHaHa&pid=Api&P=0&h=180/300x300" className="card-img-top" />
                        <div className="card-body">
                            <h6 className="card-title">Áo thun trơn</h6>
                            <p className="price">250.000đ</p>
                            <button className="btn btn-outline-dark btn-sm">Thêm giỏ hàng</button>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card">
                        <img src="https://tse4.mm.bing.net/th?id=OIP.7ZxepcJaDNoUZqs3JZPxKwHaHa&pid=Api&P=0&h=180/300x300" className="card-img-top" />
                        <div className="card-body">
                            <h6 className="card-title">Áo thun trơn</h6>
                            <p className="price">250.000đ</p>
                            <button className="btn btn-outline-dark btn-sm">Thêm giỏ hàng</button>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card">
                        <img src="https://tse4.mm.bing.net/th?id=OIP.7ZxepcJaDNoUZqs3JZPxKwHaHa&pid=Api&P=0&h=180/300x300" className="card-img-top" />
                        <div className="card-body">
                            <h6 className="card-title">Áo thun trơn</h6>
                            <p className="price">250.000đ</p>
                            <button className="btn btn-outline-dark btn-sm">Thêm giỏ hàng</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
>>>>>>> 6a994c6e (giao dien detail)
};

export default RelatedProducts;
