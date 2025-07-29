// src/pages/Home/components/ProductSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const ProductSection = ({ title, apiUrl, showViewAll = true }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(apiUrl).then((res) => setProducts(res.data.data || []));
  }, [apiUrl]);

  return (
    <section className="fashion-section" data-aos="fade-up">
      <div className="fashion-head">
        <h2>{title}</h2>
        {showViewAll && (
          <a href="#" className="view-all">
            Xem tất cả
          </a>
        )}
      </div>
      <div className="fashion-row">
        {products.slice(0, 4).map((product) => (
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
              <span className="fashion-price">{product.price}đ</span>
              {product.old_price && (
                <span className="fashion-oldprice">{product.old_price}đ</span>
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
