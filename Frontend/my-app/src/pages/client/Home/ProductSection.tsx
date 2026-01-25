import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../utils/axiosInstance";
import { useFavoriteContext } from "../../../provider/FavoriteProvider";

type Product = {
  id: number;
  name: string;
  image: string;
  image_url?: string;
  hover_image?: string;
  hover_image_url?: string;
  images?: string[];
  price: number;
  old_price?: number;
  discount?: number;
  sold?: number;
};

type ProductSectionProps = {
  title: string;
  apiUrl?: string;
  products?: Product[];
  showViewAll?: boolean;
};

const ProductSection = ({
  title,
  apiUrl,
  products: propProducts,
  showViewAll = true,
}: ProductSectionProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const navigate = useNavigate();
  const { isInFavorite, toggleFavorite } = useFavoriteContext();

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  useEffect(() => {
    // Nếu có products được truyền trực tiếp, sử dụng chúng
    if (propProducts) {
      setProducts(propProducts);
      return;
    }

    // Nếu không có products, gọi API
    if (apiUrl) {
      const fetchProducts = async () => {
        try {
          const res = await axios.get(apiUrl);
          const data = res.data as any;
          setProducts(data.data || data || []);
        } catch (err) {
          console.error("Lỗi khi gọi API:", err);
        }
      };

      fetchProducts();
    }
  }, [apiUrl, propProducts]);

  const displayedProducts = showAllProducts ? products : products.slice(0, 4);
  const hasMoreProducts = products.length > 4;

  return (
    <section className="fashion-section" data-aos="fade-up">
      <div className="fashion-head">
        <h2>{title}</h2>
        {showViewAll && hasMoreProducts && (
          <button
            className="view-all"
            onClick={() => setShowAllProducts(!showAllProducts)}
          >
            {showAllProducts ? "Thu gọn" : "Xem thêm"}
          </button>
        )}
      </div>
      <div className="fashion-row">
        {displayedProducts.map((product) => {
          // Chuẩn hóa đơn vị
          const normalize = (v: any) => {
            const n = Number(v || 0);
            return !isFinite(n) ? 0 : n < 1000 ? n * 1000 : n;
          };
          // Quy tắc: giá bán = price; giá gốc = old_price (nếu có)
          const sale = normalize(product.price);
          const original = normalize(product.old_price ?? 0);
          const hasOriginalField = original > 0;

          // ✅ Logic hover image: ưu tiên hover_image_url từ backend
          const mainImage =
            product.image_url || // ✅ Ưu tiên full URL từ backend
            product.image || // Fallback cho path trong DB
            (product.images && product.images[0]) ||
            "";

          const hoverImage =
            product.hover_image_url || // ✅ Ưu tiên full URL từ backend
            product.hover_image || // Fallback cho path trong DB
            "";
          const hasHoverImage = !!hoverImage;

          return (
            <div
              className="fashion-card"
              key={product.id}
              data-aos="zoom-in"
              onClick={() => handleProductClick(product.id)}
              style={{ cursor: "pointer" }}
            >
              {/* Icon yêu thích */}
              <div
                className="wishlist-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
                title={
                  isInFavorite(product.id)
                    ? "Bỏ khỏi yêu thích"
                    : "Thêm vào yêu thích"
                }
              >
                {isInFavorite(product.id) ? (
                  <svg
                    width="18"
                    height="18"
                    fill="#ff4d4f"
                    viewBox="0 0 24 24"
                  >
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
                <span className="fashion-badge">
                  -{Math.round(product.discount)}%
                </span>
              )}
              <img
                className="fashion-img"
                src={mainImage || "https://via.placeholder.com/200"}
                alt={product.name}
                onMouseOver={(e) => {
                  if (hasHoverImage) e.currentTarget.src = hoverImage;
                }}
                onMouseOut={(e) => {
                  if (hasHoverImage) e.currentTarget.src = mainImage;
                }}
              />
              <div className="fashion-name">{product.name}</div>
              <div>
                <span className="fashion-price">
                  {sale.toLocaleString("vi-VN")}đ
                </span>
                {hasOriginalField && original >= sale && (
                  <span className="fashion-oldprice">
                    {original.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>

              <div className="fashion-rate">
                {product.sold || 0} sản phẩm đã bán
              </div>
              <button
                className="fashion-buy"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProductClick(product.id);
                }}
              >
                Xem Ngay
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProductSection;
