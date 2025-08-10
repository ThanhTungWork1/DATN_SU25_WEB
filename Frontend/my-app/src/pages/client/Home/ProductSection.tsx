import { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import { getProductMainImage } from "../../../utils/imageUtils";

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
  apiUrl: string;
  showViewAll?: boolean;
};

const ProductSection = ({ title, apiUrl, showViewAll = true }: ProductSectionProps) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await axios.get(apiUrl);
      // Backend trả về {success: true, data: [...]}
      const productsData = res.data.data || res.data;
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
      setProducts([]);
    }
  };

  fetchProducts();
}, [apiUrl]);

  return (
    <section className="fashion-section" data-aos="fade-up">
      <div className="fashion-head">
        <h2>{title}</h2>
        {showViewAll && <a href="#" className="view-all">Xem tất cả</a>}
      </div>
      <div className="fashion-row">
        {products.slice(0, 4).map((product) => (
          <div className="fashion-card" key={product.id} data-aos="zoom-in">
            {product.discount && (
              <span className="fashion-badge">-{product.discount}%</span>
            )}
            <img
              className="fashion-img"
              src={getProductMainImage(product)}
              alt={product.name}
            />
            <div className="fashion-name">{product.name}</div>
            <div>
              <span className="fashion-price">{Number(product.price).toLocaleString("vi-VN")} VNĐ</span>
              {product.old_price && (
                <span className="fashion-oldprice">{Number(product.old_price).toLocaleString("vi-VN")} VNĐ</span>
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
