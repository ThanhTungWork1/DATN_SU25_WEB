import { useParams } from "react-router-dom";
import { useRelatedProducts } from "../../../hook/ClientHookDetail";
import { useRelatedProductsPagination } from "../../../hook/useRelatedProductsPagination";
import { BoxProduct } from "../../../components/BoxProduct";
import { useCart } from "../../../provider/CartProvider";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type {
  RouteParams,
  RelatedProductsProps,
} from "../../../types/RelatedProductsType";
import "../../../assets/styles/realte.css";

const RelatedProducts = ({ categoryId, limit = 8 }: RelatedProductsProps) => {
  const { id } = useParams<RouteParams>();
  const { addToCart } = useCart();

  // Debug: Log props và params
  console.log("🔍 [RelatedProducts DEBUG] categoryId:", categoryId);
  console.log("🔍 [RelatedProducts DEBUG] currentProductId:", id);
  console.log("🔍 [RelatedProducts DEBUG] limit:", limit);

  const {
    data: relatedProducts,
    isLoading,
    isError,
  } = useRelatedProducts(id!, categoryId, limit);

  // Debug: Log hook results
  console.log("🔍 [RelatedProducts DEBUG] relatedProducts:", relatedProducts);
  console.log("🔍 [RelatedProducts DEBUG] isLoading:", isLoading);
  console.log("🔍 [RelatedProducts DEBUG] isError:", isError);

  const { paginatedProducts, canPrev, canNext, goPrev, goNext } =
    useRelatedProductsPagination(relatedProducts || [], 4);

  if (isLoading) {
    return (
      <div className="related-products-section mt-5">
        <h4 className="related-products-title">Sản phẩm liên quan</h4>
        <div className="related-products-grid">
          {[...Array(8)].map((_, index) => (
            <div className="related-product-card skeleton" key={index}></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !relatedProducts || relatedProducts.length === 0) {
    console.log("🔍 [RelatedProducts DEBUG] No products to display.");
    return (
      <div className="related-products-section mt-5">
        <h4 className="related-products-title">Sản phẩm liên quan</h4>
        <p className="related-products-empty">Không có sản phẩm liên quan</p>
        {/* Debug info */}
        <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
          <p>Debug: isError = {String(isError)}</p>
          <p>
            Debug: relatedProducts ={" "}
            {relatedProducts ? "exists" : "null/undefined"}
          </p>
          <p>Debug: relatedProducts.length = {relatedProducts?.length || 0}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="related-products-section mt-5">
      <h4 className="related-products-title">Sản phẩm liên quan</h4>
      <div className="related-products-pagination-bar">
        <button
          className="related-products-nav-btn left"
          onClick={goPrev}
          disabled={!canPrev}
          aria-label="Trước"
        >
          <FaChevronLeft />
        </button>
        <div className="related-products-grid">
          {console.log(
            "🔍 [RelatedProducts DEBUG] paginatedProducts:",
            paginatedProducts
          )}
          {paginatedProducts.map((product) => {
            console.log(
              "🔍 [RelatedProducts DEBUG] Rendering product:",
              product.id,
              product.name
            );
            const image = product.image || (product.images?.[0] ?? "");
            return (
              <div className="related-product-card" key={product.id}>
                <BoxProduct
                  product={{
                    ...product,
                    image,
                    price: product.price,
                    old_price: product.old_price,
                    discount: product.discount,
                    sold: product.sold,
                    colors: Array.isArray(product.colors)
                      ? product.colors.map((c: any) =>
                          typeof c === "object" && c.id ? c.id : c
                        )
                      : product.colors,
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
