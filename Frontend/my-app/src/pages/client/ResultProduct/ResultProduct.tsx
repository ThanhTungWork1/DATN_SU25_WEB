import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BoxProduct } from "../../../components/BoxProduct";
import { useProductPagination } from "../../../hook/useProductList";
import "../../../assets/styles/resultSerch.css";

// Helpers to normalize search query (embedded here)
function removeDiacritics(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function normalizeQuery(raw: string) {
  const trimmed = raw.trim().replace(/\s+/g, " ");
  const lower = trimmed.toLowerCase();
  const unaccent = removeDiacritics(lower);
  return unaccent.replace(/[^a-z0-9\s]/g, "");
}

// Trang kết quả tìm kiếm sản phẩm
const ResultProduct = () => {
  // Lấy query từ URL (?query=...)
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("query")?.trim() || ""; // giữ để hiển thị UI
  const queryForApi = normalizeQuery(query); // dùng cho API

  // State page
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  // Gọi API backend để tìm kiếm sản phẩm
  const { products, pagination, loading, error, isInitialLoad } =
    useProductPagination({
      page: currentPage,
      per_page: PAGE_SIZE,
      search: queryForApi,
    });

  const navigate = useNavigate();

  // Hàm quay về trang tổng sản phẩm
  const handleBackToAll = () => {
    navigate("/products");
  };

  return (
    <>
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
            <span style={{ fontSize: 14 }}>Xem tất cả sản phẩm</span>
          </button>
        </div>
        {/* Hiển thị lỗi hoặc loading nếu có */}
        {error && <div className="alert alert-danger">{error}</div>}
        {loading && isInitialLoad ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <div className="mt-3">Đang tìm kiếm sản phẩm...</div>
          </div>
        ) : !query ? (
          <div>Vui lòng nhập từ khóa tìm kiếm.</div>
        ) : products.length === 0 ? (
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
              {products.map((product: any) => (
                <BoxProduct key={product.id} product={product} />
              ))}
            </div>
            {/* Phân trang */}
            <div className="mt-4">
              {pagination.total_pages > 1 && (
                <nav className="pagination-nav">
                  <ul className="pagination justify-content-center">
                    <li
                      className={`page-item${currentPage === 1 ? " disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        &laquo;
                      </button>
                    </li>
                    {Array.from(
                      { length: pagination.total_pages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <li
                        key={page}
                        className={`page-item${page === currentPage ? " active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item${currentPage === pagination.total_pages ? " disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === pagination.total_pages}
                      >
                        &raquo;
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ResultProduct;
