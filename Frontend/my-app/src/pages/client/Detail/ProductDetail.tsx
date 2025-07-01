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

type RouteParams = {
  id: string;
};

const ProductDetail = () => {
  const { id } = useParams<RouteParams>();
  const { data: product, isLoading, isError } = useProductDetail(id!);

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

  const [banner2, setBanner2] = useState<BannerType | null>(null);
  useEffect(() => {
    getBanners().then((banners) => {
      const found = banners.find((b) => Number(b.id) === 2);
      setBanner2(found || null);
    });
  }, []);

  useEffect(() => {}, [id]);

  if (isLoading) return <p>Đang tải...</p>;
  if (isError || !product) return <p>Lỗi hoặc không có sản phẩm.</p>;

  const selectedVariant = product.variants?.find(
    (v) => v.size === selectedSize && v.color === selectedColor?.name,
  );
  const selectedVariantStock = selectedVariant?.stock;
  const selectedVariantSku = selectedVariant?.sku;

  const thumbnailImages =
    (product.colors?.map((color) => color.image).filter(Boolean) as string[]) ||
    [];

  return (
    <>
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
            <div className="col-lg-2 col-md-3 d-none d-md-block">
              <Aside
                images={thumbnailImages}
                onSelect={setSelectedImage}
                selectedImage={selectedImage}
              />
            </div>

            <div className="col-lg-5 col-md-9 col-12">
              <MainImage imageUrl={selectedImage} />
            </div>

            <div className="col-lg-5 col-md-4 col-12">
              <ProductInfo
                product={product}
                selectedVariantStock={selectedVariantStock}
                sku={selectedVariantSku}
              />
              <hr />

              <Size
                variants={product.variants || []}
                selectedSize={selectedSize}
                onSelectSize={handleSizeSelect}
              />
              <hr />

              <Color
                colors={product.colors || []}
                selectedColor={selectedColor}
                onSelectColor={(color) => {
                  handleColorSelect(color);
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

              <ProductActions
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                maxQuantity={10}
              />
              <hr />

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

          <ProductTabs product={product} />

          {banner2 && (
            <div className="container banner-detail-middle">
              <Banner imageUrl={banner2.image_url} />
            </div>
          )}

          <RelatedProducts categoryId={product.category_id} />
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
