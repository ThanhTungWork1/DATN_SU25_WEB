import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProductDetail } from "../../../hook/ClientHookDetail";
import Aside from "./Aside";
import MainImage from "./MainImage";
import ProductInfo from "./ProductInfo";
import Size from "./Size";
import Color from "../../../components/Color";
import ProductActions from "../../../components/ProductActions";
import ProductTabs from "./ProductTabs";
import RelatedProducts from "./RelatedProducts";
import { useProductDetailLogic } from "../../../hook/useProductDetailLogic";
import { Breadcrumb } from "../../../components/Breadcrumb";
import Banner from "../../../components/Banner";
import { getBanners } from "../../../api/ApiBanner";
import type { Banner as BannerType } from "../../../types/BannerType";
import type { Product } from "../../../types/DetailType";
import { getAllColors } from "../../../api/ApiProduct";
import type { ColorType } from "../../../types/ColorType";
import "../../../assets/styles/color.css";

// =============================
// Trang chi tiết sản phẩm
// =============================

type RouteParams = {
  id: string;
};

const ProductDetail = () => {
  const { id } = useParams<RouteParams>();
  const { data: productRaw, isLoading, isError } = useProductDetail(id!);
  const product = (productRaw as any)?.data as Product | undefined;

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
  const [allColors, setAllColors] = useState<ColorType[]>([]);
  useEffect(() => {
    getBanners().then((banners) => {
      const found = banners.find((b) => b.public_id === "banner2");
      setBanner2(found || null);
    });
    getAllColors().then((res: ColorType[]) => setAllColors(res));
  }, []);

  useEffect(() => {}, [id]);

  if (isLoading) return <p>Đang tải...</p>;
  if (isError || !product) return <p>Lỗi hoặc không có sản phẩm.</p>;

  const selectedVariant = product.variants?.find(
    (v) =>
      v.size?.name === selectedSize && v.color?.name === selectedColor?.name
  );
  const selectedVariantStock = selectedVariant?.stock;
  const selectedVariantSku = selectedVariant?.sku;

  // Lấy unique colors từ variants, loại bỏ undefined
  const uniqueColors = Array.from(
    new Map(
      (product.variants || [])
        .map((v) => v.color)
        .filter(
          (color): color is ColorType => color !== undefined && color !== null
        )
        .map((color) => [color.id, color])
    ).values()
  );

  // Lấy thumbnail cho Aside: lấy ảnh đầu tiên của mỗi màu từ variants
  let colorThumbnails: string[] = [];
  const colorSet = new Set();
  if (product?.variants) {
    for (const variant of product.variants) {
      if (variant.color && variant.image && !colorSet.has(variant.color)) {
        colorThumbnails.push(variant.image);
        colorSet.add(variant.color);
      }
    }
  }
  const thumbnailImages = colorThumbnails.length
    ? colorThumbnails
    : product?.images && product.images.length
      ? product.images
      : product?.image
        ? [product.image]
        : [];

  // Map allColors để đảm bảo có trường code
  const mappedColors = allColors.map((c) => ({
    ...c,
    code: c.code || (c as any).hex_code || "",
  }));

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
          <div className="row g-0">
            <div className="col-lg-6 d-flex">
              <Aside
                images={thumbnailImages}
                onSelect={setSelectedImage}
                selectedImage={selectedImage}
              />
              <MainImage imageUrl={selectedImage} />
            </div>

            <div className="col-lg-6 product-info-col">
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
                colors={uniqueColors}
                selectedColor={selectedColor}
                onSelectColor={(color) => {
                  handleColorSelect(color);
                  const variant = product.variants?.find(
                    (v) =>
                      v.color?.id === color.id && v.size?.name === selectedSize
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
                disabled={!selectedSize || !selectedColor}
              />
              <hr />
            </div>
          </div>

          <ProductTabs product={product} />
          <RelatedProducts categoryId={product.category_id} />

          {banner2 && (
            <div className="banner-detail-middle">
              <Banner imageUrl={banner2.image_url} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
