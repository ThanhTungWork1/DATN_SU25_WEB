import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProductDetail } from "../../../hook/ClientHookDetail";
import Navbar from "../../../components/Navbar";
import Aside from "./Aside";
import MainImage from "./MainImage";
import ProductInfo from "./ProductInfo";
import Size from "./Size";
import Color from "../../../components/Color";
import ProductActions from "../../../components/ProductActions";
import ProductTabs from "./ProductTabs";
import RelatedProducts from "./RelatedProducts";
import Footer from "../../../components/Footer";
import { useProductDetailLogic } from "./useProductDetailLogic";
import "../../../assets/styles/detailProduct.css";

// =============================
// Trang chi tiết sản phẩm
// =============================

// Định nghĩa kiểu cho params route (lấy id sản phẩm từ URL)
type RouteParams = {
  id: string;
};

// Component chính cho trang chi tiết sản phẩm
const ProductDetail = () => {
  // Lấy id sản phẩm từ URL
  const { id } = useParams<RouteParams>();
  // Lấy dữ liệu chi tiết sản phẩm từ API/hook
  const { data: product, isLoading, isError } = useProductDetail(id!);
  // Sử dụng custom hook để quản lý logic chọn ảnh, size, màu, thêm giỏ hàng...
  const {
    selectedImage,
    setSelectedImage,
    selectedSize,
    selectedColor,
    handleAddToCart,
    handleBuyNow,
    handleSizeSelect,
    handleColorSelect,
  } = useProductDetailLogic(product);

  // Khi id sản phẩm thay đổi, có thể thêm logic ở đây nếu cần
  useEffect(() => {}, [id]);

  // Xử lý loading và lỗi
  if (isLoading) return <p>Đang tải...</p>;
  if (isError || !product) return <p>Lỗi hoặc không có sản phẩm.</p>;

  // =============================
  // Tìm biến thể được chọn (theo size, màu)
  // =============================
  const selectedVariant = product.variants?.find(
    (v) => v.size === selectedSize && v.color === selectedColor?.name,
  );
  const selectedVariantStock = selectedVariant?.stock;
  const selectedVariantSku = selectedVariant?.sku;

  // =============================
  // Tạo mảng ảnh thumbnail từ các màu
  // =============================
  const thumbnailImages =
    (product.colors?.map((color) => color.image).filter(Boolean) as string[]) ||
    [];

  // =============================
  // Render giao diện trang chi tiết sản phẩm
  // =============================
  return (
    <>
      {/* Navbar đầu trang */}
      <Navbar />

      <div className="container py-5">
        <div className="row g-4">
          {/* Cột trái: danh sách ảnh thumbnail */}
          <div className="col-lg-2 col-md-3 d-none d-md-block">
            <Aside
              images={thumbnailImages}
              onSelect={setSelectedImage}
              selectedImage={selectedImage}
            />
          </div>
          {/* Cột giữa: ảnh chính sản phẩm */}
          <div className="col-lg-5 col-md-9 col-12">
            <MainImage imageUrl={selectedImage} />
          </div>

          {/* Cột phải: thông tin sản phẩm, chọn size, màu, thao tác mua hàng */}
          <div className="col-lg-5 col-md-4 col-12">
            {/* Thông tin sản phẩm: tên, giá, trạng thái, mã SP... */}
            <ProductInfo
              product={product}
              selectedVariantStock={selectedVariantStock}
              sku={selectedVariantSku}
            />
            <hr />

            {/* Chọn size */}
            <Size
              variants={product.variants || []}
              selectedSize={selectedSize}
              onSelectSize={handleSizeSelect}
            />
            <hr />

            {/* Chọn màu */}
            <Color
              colors={product.colors || []}
              selectedColor={selectedColor}
              onSelectColor={(color) => {
                handleColorSelect(color);
                // Khi chọn màu, cập nhật ảnh chính nếu có ảnh riêng cho màu đó
                const variant = product.variants?.find(
                  (v) => v.color === color.name && v.size === selectedSize,
                );
                if (variant?.image) {
                  setSelectedImage(variant.image);
                } else if (color.image) {
                  setSelectedImage(color.image);
                }
              }}
            />
            <hr />

            {/* Các nút thao tác: Thêm giỏ hàng, Mua ngay */}
            <ProductActions
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              maxQuantity={10}
            />
            <hr />

            {/* Nếu có discount, hiển thị giá sau giảm */}
            {product.discount &&
            product.discount > 0 &&
            product.discount < 100 ? (
              <p className="price text-danger">
                {Math.max(
                  0,
                  Math.round(product.price * (1 - product.discount / 100)),
                ).toLocaleString()}
                đ
              </p>
            ) : null}
          </div>
        </div>

        {/* Tab mô tả, đánh giá, ảnh chi tiết... */}
        <ProductTabs product={product} />
        {/* Sản phẩm liên quan */}
        <RelatedProducts categoryId={product.category_id} />
      </div>

      {/* Footer cuối trang */}
      <Footer />
    </>
  );
};

export default ProductDetail;
