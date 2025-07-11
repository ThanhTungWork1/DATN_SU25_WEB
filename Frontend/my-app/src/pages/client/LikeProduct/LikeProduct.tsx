import { Breadcrumb } from "../../../components/Breadcrumb";
import { useWishlistContext } from "../../../provider/WishlistContext";
import { getAllProducts } from "../../../api/ApiProduct";
import { BoxProduct } from "../../../components/BoxProduct";
import { useEffect, useState } from "react";

const LikeProduct = () => {
  const { wishlist, removeFromWishlist } = useWishlistContext();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy toàn bộ sản phẩm khi vào trang
  useEffect(() => {
    setLoading(true);
    getAllProducts()
      .then((data) => {
        setAllProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Lỗi khi tải sản phẩm: " + (err?.message || ""));
        setLoading(false);
      });
  }, []);

  // Lọc sản phẩm yêu thích
  const likedProducts = allProducts.filter((p) => wishlist.includes(String(p.id)));
  // Phân trang client
  const totalPages = Math.ceil(likedProducts.length / PAGE_SIZE) || 1;
  const paginatedProducts = likedProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Nếu có id wishlist không còn trong products, tự động xóa khỏi wishlist
  useEffect(() => {
    if (!loading && allProducts.length > 0 && wishlist.length > 0) {
      const productIds = allProducts.map((p) => String(p.id));
      wishlist.forEach((id) => {
        if (!productIds.includes(id)) {
          removeFromWishlist(id);
        }
      });
    }
  }, [loading, allProducts, wishlist, removeFromWishlist]);

  return (
    <div className="product-list-container">
      <div className="breadcrumb-container-list">
        <Breadcrumb items={[
          { label: "Trang chủ", to: "/" },
          { label: "Sản phẩm", to: "/products" },
          { label: "Sản phẩm yêu thích" }
        ]} />
      </div>
      <h2 className="mb-4" style={{ color: '#00c6ab' }}>Sản phẩm yêu thích</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div>Đang tải sản phẩm...</div>
      ) : likedProducts.length === 0 ? (
        <div style={{ width: '100%', textAlign: 'center', marginTop: 60 }}>
          <img src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png" alt="empty" style={{ width: 80, opacity: 0.7 }} />
          <div style={{ color: '#bdbdbd', fontSize: 20, marginTop: 16 }}>
            Bạn chưa có sản phẩm yêu thích nào.
          </div>
        </div>
      ) : (
        <div className="product-section-container">
          <div className="product-grid">
            {paginatedProducts.map((product) => (
              <BoxProduct key={product.id} product={product} />
            ))}
          </div>
          {/* Phân trang */}
          <div className="mt-4">
            {totalPages > 1 && (
              <nav className="pagination-nav">
                <ul className="pagination justify-content-center">
                  <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      &laquo;
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                  <li className={`page-item${currentPage === totalPages ? " disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
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
  );
};

export default LikeProduct; 