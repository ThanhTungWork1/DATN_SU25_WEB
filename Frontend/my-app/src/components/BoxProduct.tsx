import { useState } from "react";
import type { Product } from "../types/ProductType";
import { Link } from "react-router-dom";
import { useCart } from "../provider/CartProvider";
import { toast } from "sonner";
import { useWishlistContext } from "../provider/WishlistContext";

interface BoxProductProps {
  product: Product;
}

/**
 * Card sản phẩm cho trang danh sách
 * @param product Sản phẩm cần hiển thị
 */
export const BoxProduct = ({ product }: BoxProductProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistContext();
  const liked = isInWishlist(product.id);

  // Lấy ảnh chính và ảnh hover
  const mainImage =
    product.image || (product.images && product.images[0]) || "";
  const hoverImage = product.images && product.images[1];
  const hasHoverImage = !!hoverImage;

  // Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: mainImage,
      quantity: 1,
    });
    toast.success("Đã thêm sản phẩm vào giỏ hàng!");
  };

  return (
    <div className="col">
      <div className="card h-100">
        <div
          className="position-relative product-image-wrapper"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {product.discount && (
            <span className="badge bg-warning position-absolute top-0 start-0">
              Giảm {Math.round(product.discount)}%
            </span>
          )}
          <Link to={`/products/${product.id}`}>
            <div className="product-image-inner">
              <img
                src={mainImage}
                className={`card-img-top product-image box-product-image${hasHoverImage ? " main-product-image" : ""}`}
                alt={product.name}
              />
              {hoverImage && (
                <img
                  src={hoverImage}
                  className="card-img-top product-image box-product-image hover-product-image"
                  alt={product.name + "hover"}
                />
              )}
            </div>
          </Link>
          {/* Cart icon overlay: Đặt ngoài Link */}
          <button
            type="button"
            className="cart-icon-overlay"
            onClick={handleAddToCart}
            tabIndex={0}
            aria-label="Thêm vào giỏ hàng"
          >
            <i className="fa-solid fa-cart-shopping"></i>
          </button>
        </div>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title product-title">
            <Link
              to={`/products/${product.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {product.name}
            </Link>
          </h5>

          <p className="product-price">
            <Link to={`/products/${product.id}`}>
              <span className="sale-price">
                {Number(product.price * 1000).toLocaleString('vi-VN')}đ
              </span>
              {product.old_price && (
                <span className="original-price">
                  {Number(product.old_price * 1000).toLocaleString('vi-VN')}đ
                </span>
              )}
            </Link>
          </p>

          <div className="d-flex justify-content-between align-items-center mt-2">
            <span className="sold-text">Đã bán {product.sold ?? 0}</span>
            <button
              className="btn btn-link p-0 m-0"
              style={{ color: liked ? "#e63946" : "#00c6ab" }}
              title="Yêu thích"
              onClick={(e) => {
                e.preventDefault();
                liked ? removeFromWishlist(product.id) : addToWishlist(product.id);
              }}
            >
              <i className={liked ? "fas fa-heart" : "far fa-heart"}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 