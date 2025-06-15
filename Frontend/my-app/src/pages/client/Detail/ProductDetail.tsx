<<<<<<< HEAD
import { useEffect, useState } from "react";
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
import { useProductDetailLogic } from "../../../hook/useProductDetailLogic";
import "../../../assets/styles/detailProduct.css";
import { Breadcrumb } from "../../../components/Breadcrumb";
import Banner from "../../../components/Banner";
import { getBanners } from "../../../api/ApiBanner";
import type { Banner as BannerType } from "../../../types/BannerType";

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

  // State cho banner quảng cáo
  const [banner2, setBanner2] = useState<BannerType | null>(null);
  useEffect(() => {
    getBanners().then((banners) => {
      const found = banners.find((b) => Number(b.id) === 2);
      setBanner2(found || null);
    });
  }, []);
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

  // Render giao diện trang chi tiết sản phẩm
  return (
    <>
      {/* Navbar đầu trang */}
      <Navbar />

      {/* Breadcrumb */}
      <div className="container py-2 breadcrumb-container-detail">
        <Breadcrumb
          items={[
            { label: "Trang chủ", to: "/" },
            { label: "Sản phẩm", to: "/products" },
            { label: product.name },
          ]}
        />
      </div>

      <div className="container py-5 product-detail-container">
        <div className="product-detail-wrapper">
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

          {/* Banner quảng cáo giữa detail và sản phẩm liên quan */}
          {banner2 && (
            <div className="container banner-detail-middle">
              <Banner imageUrl={banner2.image_url} />
            </div>
          )}

          {/* Sản phẩm liên quan */}
          <RelatedProducts categoryId={product.category_id} />
        </div>
      </div>

      {/* Footer cuối trang */}
      <Footer />
    </>
  );
=======

// Import các component con
import Navbar from '../../../components/Navbar';
import Aside from './Aside';
import MainImage from './MainImage';
import ProductInfo from './ProductInfo';
import Size from './Size';
import Color from '../../../components/Color';
import ProductActions from '../../../components/ProductActions';
import ProductMeta from './ProductMeta';
import ContentTabs from './ContentTabs';
import ProductTabs from './ProductTabs';
import RelatedProducts from './RelatedProducts';
import Footer from '../../../components/Footer';
import "../../../assets/styles/detailProduct.css";

const ProductDetail = () => {
    return (
        <>
            <Navbar />

            <div className="container py-5">
                <div className="row g-4">
                    {/* Sidebar left */}
                    <div className="col-lg-2 col-md-3 d-none d-md-block">
                        <Aside />
                    </div>

                    {/* Main image */}
                    <div className="col-lg-5 col-md-9 col-12">
                        <MainImage />
                    </div>

                    {/* Product info */}
                    <div className="col-lg-5 col-12">
                        <ProductInfo />
                        <Size />
                        <Color />
                        <ProductActions />
                        <ProductMeta />
                    </div>
                </div>

                {/* Tabs and related */}
                <ContentTabs />
                <ProductTabs />
                <RelatedProducts />
            </div>

            <Footer />
        </>
    );
>>>>>>> 6a994c6e (giao dien detail)
};

export default ProductDetail;
