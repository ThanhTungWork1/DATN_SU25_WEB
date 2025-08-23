import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../utils/axiosInstance";

type Product = {
  id: number;
  name: string;
  image: string;
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

const ProductSection = ({ title, apiUrl, products: propProducts, showViewAll = true }: ProductSectionProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const navigate = useNavigate();

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
            {showAllProducts ? 'Thu gọn' : 'Xem thêm'}
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

          return (
          <div 
            className="fashion-card" 
            key={product.id} 
            data-aos="zoom-in"
            onClick={() => handleProductClick(product.id)}
            style={{ cursor: 'pointer' }}
          >
            {product.discount && (
              <span className="fashion-badge">-{product.discount}%</span>
            )}
            <img
              className="fashion-img"
              src={product.image || "https://via.placeholder.com/200"}
              alt={product.name}
            />
            <div className="fashion-name">{product.name}</div>
            <div>
              <span className="fashion-price">{sale.toLocaleString("vi-VN")}đ</span>
              {hasOriginalField && original >= sale && (
                <span className="fashion-oldprice">{original.toLocaleString("vi-VN")}đ</span>
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
        );})}
      </div>
    </section>
  );
}

export default ProductSection;
