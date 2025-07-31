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
    product.image ||
    product.image_url ||
    (product.images && product.images[0]) ||
    "";
  const hoverImage = product.hover_image;
  const hasHoverImage = !!hoverImage;

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
            {Number(product.price * 1000).toLocaleString("vi-VN")}đ
          </span>
          {product.old_price && (
            <span className="fashion-oldprice">
              {Number(product.old_price * 1000).toLocaleString("vi-VN")}đ
            </span>
          )}
        </div>
        <div className="fashion-rate">{product.sold ?? 0} sản phẩm đã bán</div>
        <button className="fashion-buy">Xem Ngay</button>
      </Link>
    </div>
  );
};
