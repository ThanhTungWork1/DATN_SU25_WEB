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
  const [forceRefresh, setForceRefresh] = useState(0);

  // Force refresh khi component mount
  useEffect(() => {
    setForceRefresh((prev) => prev + 1);
  }, []);

  const { data: productRaw, isLoading, isError } = useProductDetail(id!);

  // ✅ Sửa lại logic: sử dụng product_full từ API response
  const product =
    (productRaw as any)?.product_full || (productRaw as Product | undefined);

  // ✅ Thêm image_url và hover_image_url từ response vào product object
  if (product && productRaw) {
    product.image_url = (productRaw as any)?.image_url || product.image_url;
    product.hover_image_url =
      (productRaw as any)?.hover_image_url || product.hover_image_url;
  }

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

  // ✅ Tự động về ảnh chính khi không có variant được chọn
  useEffect(() => {
    if (product && (!selectedSize || !selectedColor)) {
      setSelectedImage(product.image_url || product.image || "");
    }
  }, [selectedSize, selectedColor, product?.image_url, product?.image]);

  // ❌ Không tự động chọn size/màu dù chỉ có 1 variant. Người dùng phải chọn rõ ràng.

  if (isLoading) return <p>Đang tải...</p>;
  if (isError) {
    return <p>Lỗi khi tải sản phẩm.</p>;
  }
  if (!product) {
    return <p>Không tìm thấy sản phẩm.</p>;
  }

  const selectedVariant = product.variants?.find(
    (v) =>
      v.size?.name === selectedSize && v.color?.id === selectedColor?.id
  );
  const selectedVariantStock = selectedVariant?.stock;
  const selectedVariantSku = selectedVariant?.sku;

  // Nếu không có variants, tạo một variant mặc định
  if (!product.variants || product.variants.length === 0) {
    product.variants = [
      {
        id: 1,
        product_id: product.id,
        color_id: 1,
        size_id: 1,
        stock: 10,
        sku: `SKU-${product.id}`,
        color: { id: 1, name: "Default", code: "#000000" },
        size: { id: 1, name: "M" },
      },
    ];
  }

  const colorMap: Map<number, ColorType> = new Map<number, ColorType>(
    (product.variants || [])
      .map((v: any) => v.color as ColorType | undefined | null)
      .filter((c): c is ColorType => !!c)
      .map((c) => [c.id, c] as [number, ColorType])
  );
  const uniqueColors: ColorType[] = Array.from(colorMap.values());

  // ✅ Lấy danh sách size duy nhất từ tất cả variants
  const normalizeSize = (raw?: string | null): string | null => {
    if (!raw) return null;
    const token = raw.toUpperCase();
    const known = ["5XL", "2XL", "XL", "L", "M", "S"]; // thứ tự ưu tiên
    for (const k of known) if (token.includes(k)) return k;
    return raw;
  };

  const rawSizes: (string | null)[] = (product.variants || [])
    .map((v: any) => normalizeSize(v.size?.name));
  const filteredSizes: string[] = rawSizes.filter((s): s is string => !!s);
  const uniqueSizes: string[] = Array.from(new Set<string>(filteredSizes));
  uniqueSizes.sort((a: string, b: string) => {
    const order = ["S", "M", "L", "XL", "2XL", "5XL"]; // sắp xếp quen thuộc
    return order.indexOf(a) - order.indexOf(b);
  });

  let colorThumbnails: string[] = [];
  const colorSet = new Set();
  if (product?.variants) {
    for (const variant of product.variants) {
      if (variant.color && variant.image_url && !colorSet.has(variant.color)) {
        colorThumbnails.push(variant.image_url); // ✅ Sử dụng image_url thay vì image
        colorSet.add(variant.color);
      } else if (
        variant.color &&
        variant.image &&
        !colorSet.has(variant.color)
      ) {
        // Fallback nếu không có image_url
        colorThumbnails.push(variant.image);
        colorSet.add(variant.color);
      }
    }
  }

  // ✅ Sửa lại logic: ưu tiên sử dụng image_url từ backend
  const thumbnailImages = colorThumbnails.length
    ? colorThumbnails
    : product?.images && product.images.length
      ? product.images
      : product?.image_url
        ? [product.image_url] // ✅ Ưu tiên image_url
        : product?.image
          ? [product.image] // Fallback cho image path
          : [];

  // Kiểm tra xem sản phẩm có đủ thông tin cần thiết không
  if (!product.name || !product.price) {
    return <p>Sản phẩm thiếu thông tin cần thiết.</p>;
  }

  // Nếu không có image nào, sử dụng placeholder
  if (thumbnailImages.length === 0) {
    thumbnailImages.push("/placeholder-image.jpg");
  }

  // Nếu không có description, sử dụng description mặc định
  if (!product.description) {
    product.description = "Mô tả sản phẩm sẽ được cập nhật sớm.";
  }

  // Nếu không có image_url và image, sử dụng image mặc định
  if (!product.image_url && !product.image) {
    product.image_url = "/placeholder-image.jpg";
    product.image = "/placeholder-image.jpg";
  }

  // Nếu không có material, sử dụng material mặc định
  if (!product.material) {
    product.material = "Chất liệu cao cấp";
  }

  // Nếu không có sold, sử dụng sold mặc định
  if (!product.sold) {
    product.sold = 0;
  }

  // Nếu không có status, sử dụng status mặc định
  if (product.status === undefined || product.status === null) {
    product.status = true;
  }

  // Nếu không có discount, sử dụng discount mặc định
  if (product.discount === undefined || product.discount === null) {
    product.discount = 0;
  }

  // Nếu không có original_price, sử dụng original_price mặc định
  if (!product.original_price) {
    product.original_price = product.price;
  }

  // Nếu không có slug, sử dụng slug mặc định
  if (!product.slug) {
    product.slug = `product-${product.id}`;
  }

  // Nếu không có created_at và updated_at, sử dụng mặc định
  if (!product.created_at) {
    product.created_at = new Date().toISOString();
  }
  if (!product.updated_at) {
    product.updated_at = new Date().toISOString();
  }

  // Nếu không có category, sử dụng category mặc định
  if (!product.category) {
    product.category = { id: 1, name: "Default Category" };
  }

  // Nếu không có comments, sử dụng comments mặc định
  if (!product.comments) {
    product.comments = [];
  }

  // Nếu không có images, sử dụng images mặc định
  if (!product.images) {
    product.images = [];
  }

  // Nếu không có hover_image_url và hover_image, sử dụng hover_image mặc định
  if (!product.hover_image_url && !product.hover_image) {
    product.hover_image_url = product.image_url || product.image;
    product.hover_image = product.image;
  }

  // Nếu không có image_url, sử dụng image làm fallback
  if (!product.image_url && product.image) {
    product.image_url = product.image;
  }
  // Nếu không có hover_image_url, sử dụng hover_image hoặc image_url làm fallback
  if (!product.hover_image_url) {
    product.hover_image_url =
      product.hover_image || product.image_url || product.image;
  }

  // Nếu không có final_price, tính toán từ price và discount
  if (!product.final_price) {
    if (product.discount && product.discount > 0) {
      product.final_price =
        product.price - (product.price * product.discount) / 100;
    } else {
      product.final_price = product.price;
    }
  }

  // Nếu không có average_rating, sử dụng average_rating mặc định
  if (!product.average_rating) {
    product.average_rating = 0;
  }

  // Nếu không có old_price, sử dụng old_price mặc định
  if (!product.old_price) {
    product.old_price = product.price;
  }

  // Nếu không có hex_code, sử dụng hex_code mặc định
  if (!product.hex_code) {
    product.hex_code = "#000000";
  }

  // Nếu không có public_id, sử dụng public_id mặc định
  if (!product.public_id) {
    product.public_id = `product-${product.id}`;
  }

  // Nếu không có success, sử dụng success mặc định
  if (product.success === undefined || product.success === null) {
    product.success = true;
  }

  // Nếu không có message, sử dụng message mặc định
  if (!product.message) {
    product.message = "Lấy sản phẩm thành công";
  }

  // Nếu không có pagination, sử dụng pagination mặc định
  if (!product.pagination) {
    product.pagination = {
      current_page: 1,
      per_page: 10,
      total: 1,
      total_pages: 1,
      has_next_page: false,
      has_prev_page: false,
    };
  }

  // Nếu không có status_code, sử dụng status_code mặc định
  if (!product.status_code) {
    product.status_code = 200;
  }

  // Nếu không có error, sử dụng error mặc định
  if (!product.error) {
    product.error = null;
  }

  // Nếu không có data, sử dụng data mặc định
  if (!product.data) {
    product.data = product;
  }

  // Nếu không có id, sử dụng id mặc định
  if (!product.id) {
    product.id = parseInt(id || "1");
  }

  // Nếu không có category_id, sử dụng category_id mặc định
  if (!product.category_id) {
    product.category_id = 1;
  }

  // Nếu không có name, sử dụng name mặc định
  if (!product.name) {
    product.name = "Sản phẩm mặc định";
  }

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
                selectedVariant={selectedVariant}
                selectedVariantStock={selectedVariantStock}
                sku={selectedVariantSku}
              />
              <hr />

              <Size
                variants={product.variants || []}
                selectedSize={selectedSize}
                onSelectSize={handleSizeSelect}
                sizes={uniqueSizes}
                isDisabled={(size) => {
                  const normalizeSize = (raw?: string | null): string | null => {
                    if (!raw) return null;
                    const token = raw.toUpperCase();
                    const known = ["5XL", "2XL", "XL", "L", "M", "S"];
                    for (const k of known) if (token.includes(k)) return k;
                    return raw;
                  };
                  // Nếu đã chọn màu, khoá các size không có variant phù hợp hoặc hết hàng
                  if (selectedColor) {
                    const v = (product.variants || []).find(
                      (it: any) => normalizeSize(it.size?.name) === size && it.color?.id === selectedColor.id
                    );
                    return !v || v.stock === 0;
                  }
                  // Nếu chưa chọn màu, disable nếu size không xuất hiện ở bất kỳ variant còn hàng nào
                  return !(product.variants || []).some(
                    (it: any) => normalizeSize(it.size?.name) === size && (it.stock === undefined || it.stock === null || it.stock > 0)
                  );
                }}
              />
              <hr />

              <Color
                // Hiển thị đúng các màu có trong variants của sản phẩm
                colors={uniqueColors}
                selectedColor={selectedColor}
                onSelectColor={(color: ColorType) => {
                  handleColorSelect(color);
                  const normalizeSize = (raw?: string | null): string | null => {
                    if (!raw) return null;
                    const token = raw.toUpperCase();
                    const known = ["5XL", "2XL", "XL", "L", "M", "S"];
                    for (const k of known) if (token.includes(k)) return k;
                    return raw;
                  };
                  const normalizedSelected = normalizeSize(selectedSize);
                  const variant = product.variants?.find(
                    (v: any) => v.color?.id === color.id && normalizeSize(v.size?.name) === normalizedSelected
                  );
                  if (variant?.image_url) {
                    setSelectedImage(variant.image_url); // ✅ Hiển thị ảnh variant
                  } else if (variant?.image) {
                    setSelectedImage(variant.image); // Fallback
                  } else {
                    // ✅ Nếu không có variant, về ảnh chính
                    setSelectedImage(product.image_url || product.image || "");
                  }
                }}
                isDisabled={(color) => {
                  const normalizeSize = (raw?: string | null): string | null => {
                    if (!raw) return null;
                    const token = raw.toUpperCase();
                    const known = ["5XL", "2XL", "XL", "L", "M", "S"];
                    for (const k of known) if (token.includes(k)) return k;
                    return raw;
                  };
                  // Nếu đã chọn size, khoá màu không có variant phù hợp hoặc hết hàng
                  if (selectedSize) {
                    const normalizedSelected = normalizeSize(selectedSize);
                    const v = (product.variants || []).find(
                      (it: any) => it.color?.id === color.id && normalizeSize(it.size?.name) === normalizedSelected
                    );
                    return !v || v.stock === 0;
                  }
                  // Nếu chưa chọn size, disable nếu màu không xuất hiện ở bất kỳ variant còn hàng nào
                  return !(product.variants || []).some(
                    (it: any) => it.color?.id === color.id && (it.stock === undefined || it.stock === null || it.stock > 0)
                  );
                }}
              />
              <hr />

              <ProductActions
                productId={product.id}
                variantId={selectedVariant?.id || undefined}
                maxQuantity={selectedVariantStock || 10}
                disabled={!selectedSize || !selectedColor}
                productName={product.name}
                productPrice={(() => {
                  const price = selectedVariant?.price || product.price || 0;
                  return price;
                })()}
                productImage={selectedImage || product.image_url || product.image || ""}
              />
              <hr />
            </div>
          </div>

          <ProductTabs product={product} />

          <RelatedProducts categoryId={product.category_id || 1} />

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
