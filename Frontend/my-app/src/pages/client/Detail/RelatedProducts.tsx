import { useParams } from "react-router-dom";
import { useRelatedProducts } from "../../../hook/ClientHookDetail";
import { useRelatedProductsPagination } from "../../../hook/useRelatedProductsPagination";
import { BoxProduct } from "../../../components/BoxProduct";
import { useCart } from "../../../provider/CartProvider";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toast } from "sonner";
import type {
  RouteParams,
  RelatedProductsProps,
} from "../../../types/RelatedProductsType";
import "../../../assets/styles/realte.css";

const RelatedProducts = ({ categoryId, limit = 8 }: RelatedProductsProps) => {
  const { id } = useParams<RouteParams>();
  const { addToCart } = useCart();

  const {
    data: relatedProducts,
    isLoading,
    isError,
  } = useRelatedProducts(id!, categoryId, limit);

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
    return (
      <div className="related-products-section mt-5">
        <h4 className="related-products-title">Sản phẩm liên quan</h4>
        <p className="related-products-empty">Không có sản phẩm liên quan</p>
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
          {paginatedProducts.map((product) => {
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
