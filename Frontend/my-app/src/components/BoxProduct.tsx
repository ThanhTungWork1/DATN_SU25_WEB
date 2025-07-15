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

      <button className="fashion-buy" onClick={handleAddToCart}>
        Xem Ngay
      </button>
    </div>
  );
};
