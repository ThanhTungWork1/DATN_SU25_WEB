import type { Product } from "../types/ProductType";
import { Link } from "react-router-dom";
import { useWishlistContext } from "../provider/WishlistContext";
import "../assets/styles/boxSP.css";

interface BoxProductProps {
  product: Product;
}

export const BoxProduct = ({ product }: BoxProductProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } =
    useWishlistContext();
  const liked = isInWishlist(product.id);

  // ✅ Sửa lại logic: ưu tiên image_url từ backend
  const mainImage =
    product.image_url || // ✅ Ưu tiên full URL từ backend
    product.image || // Fallback cho path trong DB
    (product.images && product.images[0]) ||
    "";

  // ✅ Sửa lại logic: ưu tiên hover_image_url từ backend
  const hoverImage =
    product.hover_image_url || // ✅ Ưu tiên full URL từ backend
    product.hover_image || // Fallback cho path trong DB
    "";
  const hasHoverImage = !!hoverImage;

  return (
    <div className="fashion-card" data-aos="zoom-in">
      <div
        className="wishlist-icon"
        onClick={(e) => {
          e.stopPropagation();
          liked ? removeFromWishlist(product.id) : addToWishlist(product.id);
        }}
        title={liked ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
      >
        {liked ? (
          <svg width="18" height="18" fill="#ff4d4f" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="#ff4d4f"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        )}
      </div>
      {product.discount && (
        <span className="fashion-badge">-{Math.round(product.discount)}%</span>
      )}

      <Link to={`/products/${product.id}`}>
        <img
          className="fashion-img"
          src={mainImage}
          alt={product.name}
          onMouseOver={(e) => {
            if (hasHoverImage) e.currentTarget.src = hoverImage;
          }}
          onMouseOut={(e) => {
            if (hasHoverImage) e.currentTarget.src = mainImage;
          }}
        />
      </Link>

      <div className="fashion-name">
        <Link
          to={`/products/${product.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {product.name}
        </Link>
      </div>

      <Link to={`/products/${product.id}`} style={{ textDecoration: "none" }}>
        <div>
          <span className="fashion-price">
            {Number(product.price).toLocaleString("vi-VN")} VND
          </span>
          {product.old_price && (
            <span className="fashion-oldprice">
              {Number(product.old_price).toLocaleString("vi-VN")} VND
            </span>
          )}
        </div>
        <div className="fashion-rate">{product.sold ?? 0} sản phẩm đã bán</div>
        <button className="fashion-buy">Xem Ngay</button>
      </Link>
    </div>
  );
};
