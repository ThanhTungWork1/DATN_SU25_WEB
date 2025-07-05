import { Breadcrumb } from "../../../components/Breadcrumb";
import { useWishlistContext } from "../../../provider/WishlistContext";
import { useProductPagination } from "../../../hook/useProductList";
import { BoxProduct } from "../../../components/BoxProduct";
import { useEffect, useState } from "react";

const LikeProduct = () => {
  const { wishlist, removeFromWishlist } = useWishlistContext();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  // Gọi API backend để lấy sản phẩm yêu thích (có thể cần truyền filter nếu có)
  const { products, pagination, loading, error } = useProductPagination({
    page: currentPage,
    per_page: PAGE_SIZE,
    // Có thể truyền thêm filter nếu cần
  });

  // Lọc sản phẩm yêu thích
  const likedProducts = products.filter((p) =>
    wishlist.includes(String(p.id))
  );

  // Nếu có id wishlist không còn trong products, tự động xóa khỏi wishlist
  useEffect(() => {
    if (!loading && products.length > 0 && wishlist.length > 0) {
      const productIds = products.map((p) => String(p.id));
      wishlist.forEach((id) => {
        if (!productIds.includes(id)) {
          removeFromWishlist(id);
        }
      });
    }
  }, [loading, products, wishlist, removeFromWishlist]);

  return (
    <div className="container my-4">
      <div className="breadcrumb-container-list">
        <Breadcrumb items={[
          { label: "Trang chủ", to: "/" },
          { label: "Sản phẩm yêu thích" }
        ]} />
      </div>
      <h2 className="mb-4" style={{ color: '#00c6ab' }}>Sản phẩm yêu thích</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div>Đang tải sản phẩm...</div>
      ) : products.length === 0 ? (
        <div style={{ width: '100%', textAlign: 'center', marginTop: 60 }}>
          <img src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png" alt="empty" style={{ width: 80, opacity: 0.7 }} />
          <div style={{ color: '#bdbdbd', fontSize: 20, marginTop: 16 }}>
            Bạn chưa có sản phẩm yêu thích nào.
          </div>
        </div>
      ) : (
        <div className="product-section-container">
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-4">
            {likedProducts.map((product) => (
              <BoxProduct key={product.id} product={product} />
            ))}
          </div>
          {/* Phân trang */}
          <div className="mt-4">
            {pagination.total_pages > 1 && (
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
                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
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
                  <li className={`page-item${currentPage === pagination.total_pages ? " disabled" : ""}`}>
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
  );
};

export default LikeProduct; 