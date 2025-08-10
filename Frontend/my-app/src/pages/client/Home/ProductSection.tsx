import { useEffect, useState } from "react";
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
        {displayedProducts.map((product) => (
          <div className="fashion-card" key={product.id} data-aos="zoom-in">
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
              <span className="fashion-price">{product.price.toLocaleString()}đ</span>
              {product.old_price && (
                <span className="fashion-oldprice">{product.old_price.toLocaleString()}đ</span>
              )}
            </div>

            <div className="fashion-rate">
              {product.sold || 0} sản phẩm đã bán
            </div>
            <button className="fashion-buy">Xem Ngay</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductSection;
