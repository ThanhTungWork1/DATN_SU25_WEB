import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BoxProduct } from "../../../components/BoxProduct";
import { useProductList } from "../../../hook/useProductList";
import { filterProducts } from "../../../utils/productFilter";
import type { Product } from "../../../types/ProductType";
import "../../../assets/styles/ListProducts.css";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { Section } from "../../../components/Section";

// Trang kết quả tìm kiếm sản phẩm
const ResultProduct = () => {
  // Lấy query từ URL (?query=...)
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("query")?.trim() || "";

  // Lấy toàn bộ sản phẩm (có thể dùng custom hook, không phân trang)
  // Nếu muốn tối ưu, có thể fetch riêng API search ở đây
  const { products, loading, error } = useProductList(1, 9999); // lấy tất cả sản phẩm

  // State lưu kết quả lọc
  const [result, setResult] = useState<Product[]>([]);

  const navigate = useNavigate();

  // Lọc sản phẩm khi có query hoặc products thay đổi
  useEffect(() => {
    if (!query) {
      setResult([]);
      return;
    }
    // Dùng lại filterProducts, chỉ lọc theo tên
    const filtered = filterProducts(products, { name: query });
    setResult(filtered);
  }, [query, products]);

  // Hàm quay về trang tổng sản phẩm
  const handleBackToAll = () => {
    navigate("/products");
  };

  return (
    <>
      <Navbar />
      <Section />
      <div className="container my-4 search-result-container">
        {/* Nút quay về trang tổng sản phẩm */}
        <h4 className="mb-3">
          Kết quả tìm kiếm cho:{" "}
          <span style={{ color: "#09dbc7" }}>{query}</span>
        </h4>
        <div className="mb-1">
          <button
            className="btn btn-link back-to-all-btn"
            onClick={handleBackToAll}
            style={{
              textDecoration: "none",
              fontSize: 14,
              color: "#333",
              padding: 0,
            }}
          >
            {/* <span style={{fontSize: 18, marginRight: 6}}>&larr;</span> */}
            <span style={{ fontSize: 14 }}>Xem tất cả sản phẩm</span>
          </button>
        </div>
        {/* Hiển thị lỗi hoặc loading nếu có */}
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div>Đang tải sản phẩm...</div>
        ) : !query ? (
          <div>Vui lòng nhập từ khóa tìm kiếm.</div>
        ) : result.length === 0 ? (
          <div className="search-empty">
            <img
              src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
              alt="not found"
              style={{ width: 80, marginBottom: 12, opacity: 0.7 }}
            />
            <div>Không tìm thấy sản phẩm phù hợp.</div>
          </div>
        ) : (
          <div className="product-section-container">
            <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-4">
              {result.map((product) => (
                <BoxProduct key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ResultProduct;
