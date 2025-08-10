import React from "react";
import useProductTop from "../../../hook/useProductTop";
import "../../../assets/styles/TopProductsSection.css"; // Đảm bảo file này tồn tại

const TopProductsSection = () => {
  const { products, loading } = useProductTop();

  if (loading) return <p>Đang tải sản phẩm...</p>;

  return (
    <div className="top-clothing-section">
      <h2>Top 5 Sản Phẩm Hôm Nay</h2>
      <div className="product-list">
        {products.map((item, index) => (
          <div className="product-card" key={item.id}>
            <div className="product-rank">{index + 1}</div>

            <div
              className="product-image"
              style={{
                backgroundImage: `url(${item.image})`,
              }}
            />

            <div className="product-info">
              <h3>{item.name}</h3>
              <p>{item.description || "Không có mô tả."}</p>

              <div className="product-price">
                <span className="new-price">
                  {item.price?.toLocaleString("vi-VN")}₫
                </span>

                {item.old_price && (
                  <span className="old-price">
                    {item.old_price?.toLocaleString("vi-VN")}₫
                  </span>
                )}

                {item.color && <span className="color">Màu: {item.color}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProductsSection;
