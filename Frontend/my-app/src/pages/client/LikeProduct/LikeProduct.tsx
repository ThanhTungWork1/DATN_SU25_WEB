import { Breadcrumb } from "../../../components/Breadcrumb";
import { useWishlistContext } from "../../../provider/WishlistContext";
import { useProductList } from "../../../hook/useProductList";
import { BoxProduct } from "../../../components/BoxProduct";
import { useEffect } from "react";

const LikeProduct = () => {
  const { wishlist, removeFromWishlist } = useWishlistContext();
  const { products, loading, error } = useProductList(1, 1000); // lấy nhiều sản phẩm để lọc

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
      <div className="like-product-list row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-4">
        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : likedProducts.length === 0 ? (
          <div style={{ width: '100%', textAlign: 'center', marginTop: 60 }}>
            <img src="https://cdn-icons-png.flaticon.com/512/2748/2748558.png" alt="empty" style={{ width: 80, opacity: 0.7 }} />
            <div style={{ color: '#bdbdbd', fontSize: 20, marginTop: 16 }}>
              Bạn chưa có sản phẩm yêu thích nào.
            </div>
          </div>
        ) : (
          likedProducts.map((product) => (
            <BoxProduct key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
};

export default LikeProduct; 