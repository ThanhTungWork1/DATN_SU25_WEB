import { useParams } from "react-router-dom";
<<<<<<< HEAD
import { useRelatedProducts } from "../../../hook/ClientHookDetail";
=======
import "../../../assets/styles/detailProduct.css";
import { BoxProduct } from "../../../components/BoxProduct";
>>>>>>> bc9cc18e (spa lai giao dien va cac file code, nang cap serch,filte)
import { useRelatedProductsPagination } from "../../../hook/useRelatedProductsPagination";
import { BoxProduct } from "../../../components/BoxProduct";
import { useCart } from "../../../provider/CartProvider";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
<<<<<<< HEAD
import { toast } from "sonner";
import type {
  RouteParams,
  RelatedProductsProps,
} from "../../../types/RelatedProductsType";
=======
import type { RouteParams, RelatedProductsProps } from "../../../types/RelatedProductsType";

// =============================
// Component hiển thị danh sách sản phẩm liên quan
// =============================
>>>>>>> bc9cc18e (spa lai giao dien va cac file code, nang cap serch,filte)

const RelatedProducts = ({ categoryId, limit = 8 }: RelatedProductsProps) => {
  const { id } = useParams<RouteParams>();
  const { addToCart } = useCart();

  const {
    data: relatedProducts,
    isLoading,
    isError,
  } = useRelatedProducts(id!, categoryId, limit);

  const {
    paginatedProducts,
    canPrev,
    canNext,
    goPrev,
    goNext,
  } = useRelatedProductsPagination(relatedProducts || [], 4);

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

  if (isError || !relatedProducts || relatedProducts.length === 0) {
    return (
      <div className="related-products mt-5">
        <h4 className="text-center mb-4">Sản phẩm liên quan</h4>
        <p className="text-center text-muted">Không có sản phẩm liên quan</p>
      </div>
    );
  }

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
          {paginatedProducts.map((product) => {
            const image =
              product.image || (product.images?.[0] ?? "");

            return (
              <div className="related-product-item" key={product.id}>
                <BoxProduct
                  product={{
                    ...product,
                    image,
                    colors: Array.isArray(product.colors)
                      ? product.colors.map((c: any) =>
                          typeof c === "object" && c.id ? c.id : c
                        )
                      : product.colors,
                  }}
                  onAddToCart={() => {
                    const finalPrice =
                      product.discount && product.discount > 0
                        ? Math.max(
                            0,
                            Math.round(
                              product.price * (1 - product.discount / 100)
                            )
                          )
                        : product.price;
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: finalPrice,
                      image,
                      quantity: 1,
                    });
                    toast.success("Đã thêm sản phẩm vào giỏ hàng!");
                  }}
                />
              </div>
            );
          })}
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
};

export default RelatedProducts;
