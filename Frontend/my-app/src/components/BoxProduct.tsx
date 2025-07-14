import { useState } from "react";
import type { Product } from "../types/ProductType";
import { Link } from "react-router-dom";
import { useCart } from "../provider/CartProvider";
import { toast } from "sonner";
import { useWishlistContext } from "../provider/WishlistContext";
import "../assets/styles/boxSP.css";

interface BoxProductProps {
  product: Product;
  onAddToCart?: () => void;
}

export const BoxProduct = ({ product, onAddToCart }: BoxProductProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } =
    useWishlistContext();
  const liked = isInWishlist(product.id);

  const mainImage =
    product.image || product.image_url || (product.images && product.images[0]);
  const hoverImage = product.hover_image;
  const hasHoverImage = !!hoverImage;

  // Log chi tiết dữ liệu sản phẩm để kiểm tra các trường, đặc biệt là trường ảnh
  console.log("BoxProduct FULL DATA:", JSON.stringify(product, null, 2));

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
    <div className="product-card">
      <div
        className="product-card__image-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {product.discount && (
          <span className="product-card__badge">
            Giảm {Math.round(product.discount)}%
          </span>
        )}
        <Link to={`/products/${product.id}`}>
          <div className="product-card__image-inner">
            <img
              src={mainImage}
              className="product-card__image"
              alt={product.name}
            />
            {hasHoverImage && (
              <img
                src={hoverImage}
                className="product-card__image product-card__image--hover"
                alt={product.name + " hover"}
              />
            )}
          </div>
        </Link>
        {/* GỠ BỎ NỀN TRẮNG ĐỤC */}
        <Link
          to={`/products/${product.id}`}
          className="product-card__buy-now"
          tabIndex={0}
          aria-label="Mua ngay"
          onClick={e => e.stopPropagation()}
        >
          MUA NGAY &rarr;
        </Link>
      </div>
      <div className="product-card__body">
        <h5 className="product-card__title">
          <Link
            to={`/products/${product.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {product.name}
          </Link>
        </h5>
        <p className="product-card__price">
          <span className="product-card__sale-price">
            {Number(product.price * 1000).toLocaleString("vi-VN")}đ
          </span>
          {product.old_price && (
            <span className="product-card__original-price">
              {Number(product.old_price * 1000).toLocaleString("vi-VN")}đ
            </span>
          )}
        </p>
        <div className="product-card__footer">
          <span className="product-card__sold">Đã bán {product.sold ?? 0}</span>
          <button
            className="product-card__wishlist-btn"
            style={{ color: liked ? "#e63946" : "#00c6ab" }}
            title="Yêu thích"
            onClick={(e) => {
              e.preventDefault();
              liked
                ? removeFromWishlist(product.id)
                : addToWishlist(product.id);
            }}
          >
            <i className={liked ? "fas fa-heart" : "far fa-heart"}></i>
          </button>
        </div>
      </div>
    </div>
  );
};
