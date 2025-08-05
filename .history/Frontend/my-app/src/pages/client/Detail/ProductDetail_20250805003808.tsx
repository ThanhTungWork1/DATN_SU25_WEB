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
    setForceRefresh(prev => prev + 1);
  }, []);
  
  const { data: productRaw, isLoading, isError } = useProductDetail(id!);
  
  // Debug: Log raw data
  console.log('🔍 [ProductDetail DEBUG] Component rendered, forceRefresh:', forceRefresh);
  console.log('🔍 [DEBUG] productRaw:', productRaw);
  console.log('🔍 [DEBUG] productRaw?.product_full:', (productRaw as any)?.product_full);
  
  // ✅ Sửa lại logic: sử dụng product_full từ API response
  const product = (productRaw as any)?.product_full || productRaw as Product | undefined;
  
  // ✅ Thêm image_url và hover_image_url từ response vào product object
  if (product && productRaw) {
    product.image_url = (productRaw as any)?.image_url || product.image_url;
    product.hover_image_url = (productRaw as any)?.hover_image_url || product.hover_image_url;
  }
  
  // Debug: Log final product
  console.log('🔍 [DEBUG] final product:', product);

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
      setSelectedImage(product.image_url || product.image || '');
    }
  }, [selectedSize, selectedColor, product?.image_url, product?.image]);

  if (isLoading) return <p>Đang tải...</p>;
  if (isError) {
    console.log('🔍 [DEBUG] Error occurred:', isError);
    return <p>Lỗi khi tải sản phẩm.</p>;
  }
  if (!product) {
    console.log('🔍 [DEBUG] No product found');
    return <p>Không tìm thấy sản phẩm.</p>;
  }

  // Debug: Log product variants
  console.log('🔍 [DEBUG] product.variants:', product.variants);
  console.log('🔍 [DEBUG] selectedSize:', selectedSize);
  console.log('🔍 [DEBUG] selectedColor:', selectedColor);
  
  const selectedVariant = product.variants?.find(
    (v) =>
      v.size?.name === selectedSize && v.color?.name === selectedColor?.name
  );
  const selectedVariantStock = selectedVariant?.stock;
  const selectedVariantSku = selectedVariant?.sku;

  // Nếu không có variants, tạo một variant mặc định
  if (!product.variants || product.variants.length === 0) {
    console.log('🔍 [DEBUG] No variants found, creating default variant');
    product.variants = [{
      id: 1,
      product_id: product.id,
      color_id: 1,
      size_id: 1,
      stock: 10,
      sku: `SKU-${product.id}`,
      color: { id: 1, name: 'Default', code: '#000000' },
      size: { id: 1, name: 'M' }
    }];
  }

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

  let colorThumbnails: string[] = [];
  const colorSet = new Set();
  if (product?.variants) {
    for (const variant of product.variants) {
      if (variant.color && variant.image_url && !colorSet.has(variant.color)) {
        colorThumbnails.push(variant.image_url); // ✅ Sử dụng image_url thay vì image
        colorSet.add(variant.color);
      } else if (variant.color && variant.image && !colorSet.has(variant.color)) {
        // Fallback nếu không có image_url
        colorThumbnails.push(variant.image);
        colorSet.add(variant.color);
      }
    }
  }
  // Debug: Log images
  console.log('🔍 [DEBUG] product.image:', product.image);
  console.log('🔍 [DEBUG] product.image_url:', product.image_url);
  console.log('🔍 [DEBUG] product.images:', product.images);
  console.log('🔍 [DEBUG] colorThumbnails:', colorThumbnails);
  
  // ✅ Sửa lại logic: ưu tiên sử dụng image_url từ backend
  const thumbnailImages = colorThumbnails.length
    ? colorThumbnails
    : product?.images && product.images.length
      ? product.images
      : product?.image_url
        ? [product.image_url]  // ✅ Ưu tiên image_url
        : product?.image
          ? [product.image]    // Fallback cho image path
          : [];
        
  console.log('🔍 [DEBUG] final thumbnailImages:', thumbnailImages);

  // Kiểm tra xem sản phẩm có đủ thông tin cần thiết không
  if (!product.name || !product.price) {
    console.log('🔍 [DEBUG] Product missing required fields');
    return <p>Sản phẩm thiếu thông tin cần thiết.</p>;
  }

  // Nếu không có image nào, sử dụng placeholder
  if (thumbnailImages.length === 0) {
    console.log('🔍 [DEBUG] No images found, using placeholder');
    thumbnailImages.push('/placeholder-image.jpg');
  }

  // Nếu không có description, sử dụng description mặc định
  if (!product.description) {
    console.log('🔍 [DEBUG] No description found, using default');
    product.description = 'Mô tả sản phẩm sẽ được cập nhật sớm.';
  }

  // Nếu không có image_url và image, sử dụng image mặc định
  if (!product.image_url && !product.image) {
    console.log('🔍 [DEBUG] No image_url and image found, using default');
    product.image_url = '/placeholder-image.jpg';
    product.image = '/placeholder-image.jpg';
  }

  // Nếu không có material, sử dụng material mặc định
  if (!product.material) {
    console.log('🔍 [DEBUG] No material found, using default');
    product.material = 'Chất liệu cao cấp';
  }

  // Nếu không có sold, sử dụng sold mặc định
  if (!product.sold) {
    console.log('🔍 [DEBUG] No sold found, using default');
    product.sold = 0;
  }

  // Nếu không có status, sử dụng status mặc định
  if (product.status === undefined || product.status === null) {
    console.log('🔍 [DEBUG] No status found, using default');
    product.status = true;
  }

  // Nếu không có discount, sử dụng discount mặc định
  if (product.discount === undefined || product.discount === null) {
    console.log('🔍 [DEBUG] No discount found, using default');
    product.discount = 0;
  }

  // Nếu không có original_price, sử dụng original_price mặc định
  if (!product.original_price) {
    console.log('🔍 [DEBUG] No original_price found, using default');
    product.original_price = product.price;
  }

  // Nếu không có slug, sử dụng slug mặc định
  if (!product.slug) {
    console.log('🔍 [DEBUG] No slug found, using default');
    product.slug = `product-${product.id}`;
  }

  // Nếu không có created_at và updated_at, sử dụng mặc định
  if (!product.created_at) {
    console.log('🔍 [DEBUG] No created_at found, using default');
    product.created_at = new Date().toISOString();
  }
  if (!product.updated_at) {
    console.log('🔍 [DEBUG] No updated_at found, using default');
    product.updated_at = new Date().toISOString();
  }

  // Nếu không có category, sử dụng category mặc định
  if (!product.category) {
    console.log('🔍 [DEBUG] No category found, using default');
    product.category = { id: 1, name: 'Default Category' };
  }

  // Nếu không có comments, sử dụng comments mặc định
  if (!product.comments) {
    console.log('🔍 [DEBUG] No comments found, using default');
    product.comments = [];
  }

  // Nếu không có images, sử dụng images mặc định
  if (!product.images) {
    console.log('🔍 [DEBUG] No images found, using default');
    product.images = [];
  }

  // Nếu không có hover_image_url và hover_image, sử dụng hover_image mặc định
  if (!product.hover_image_url && !product.hover_image) {
    console.log('🔍 [DEBUG] No hover_image_url and hover_image found, using default');
    product.hover_image_url = product.image_url || product.image;
    product.hover_image = product.image;
  }

  // Nếu không có image_url, sử dụng image làm fallback
  if (!product.image_url && product.image) {
    console.log('🔍 [DEBUG] No image_url found, using image as fallback');
    product.image_url = product.image;
  }
  // Nếu không có hover_image_url, sử dụng hover_image hoặc image_url làm fallback
  if (!product.hover_image_url) {
    console.log('🔍 [DEBUG] No hover_image_url found, using fallback');
    product.hover_image_url = product.hover_image || product.image_url || product.image;
  }

  // Nếu không có final_price, tính toán từ price và discount
  if (!product.final_price) {
    console.log('🔍 [DEBUG] No final_price found, calculating from price and discount');
    if (product.discount && product.discount > 0) {
      product.final_price = product.price - (product.price * product.discount / 100);
    } else {
      product.final_price = product.price;
    }
  }

  // Nếu không có average_rating, sử dụng average_rating mặc định
  if (!product.average_rating) {
    console.log('🔍 [DEBUG] No average_rating found, using default');
    product.average_rating = 0;
  }

  // Nếu không có old_price, sử dụng old_price mặc định
  if (!product.old_price) {
    console.log('🔍 [DEBUG] No old_price found, using default');
    product.old_price = product.price;
  }

  // Nếu không có hex_code, sử dụng hex_code mặc định
  if (!product.hex_code) {
    console.log('🔍 [DEBUG] No hex_code found, using default');
    product.hex_code = '#000000';
  }

  // Nếu không có public_id, sử dụng public_id mặc định
  if (!product.public_id) {
    console.log('🔍 [DEBUG] No public_id found, using default');
    product.public_id = `product-${product.id}`;
  }

  // Nếu không có success, sử dụng success mặc định
  if (product.success === undefined || product.success === null) {
    console.log('🔍 [DEBUG] No success found, using default');
    product.success = true;
  }

  // Nếu không có message, sử dụng message mặc định
  if (!product.message) {
    console.log('🔍 [DEBUG] No message found, using default');
    product.message = 'Lấy sản phẩm thành công';
  }

  // Nếu không có pagination, sử dụng pagination mặc định
  if (!product.pagination) {
    console.log('🔍 [DEBUG] No pagination found, using default');
    product.pagination = {
      current_page: 1,
      per_page: 10,
      total: 1,
      total_pages: 1,
      has_next_page: false,
      has_prev_page: false
    };
  }

  // Nếu không có status_code, sử dụng status_code mặc định
  if (!product.status_code) {
    console.log('🔍 [DEBUG] No status_code found, using default');
    product.status_code = 200;
  }

  // Nếu không có error, sử dụng error mặc định
  if (!product.error) {
    console.log('🔍 [DEBUG] No error found, using default');
    product.error = null;
  }

  // Nếu không có data, sử dụng data mặc định
  if (!product.data) {
    console.log('🔍 [DEBUG] No data found, using default');
    product.data = product;
  }

  // Nếu không có id, sử dụng id mặc định
  if (!product.id) {
    console.log('🔍 [DEBUG] No id found, using default');
    product.id = parseInt(id || '1');
  }

  // Nếu không có category_id, sử dụng category_id mặc định
  if (!product.category_id) {
    console.log('🔍 [DEBUG] No category_id found, using default');
    product.category_id = 1;
  }

  // Nếu không có name, sử dụng name mặc định
  if (!product.name) {
    console.log('🔍 [DEBUG] No name found, using default');
    product.name = 'Sản phẩm mặc định';
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
                                 onSelectColor={(color: ColorType) => {
                   handleColorSelect(color);
                   const variant = product.variants?.find(
                     (v) =>
                       v.color?.id === color.id && v.size?.name === selectedSize
                   );
                   if (variant?.image_url) {
                     setSelectedImage(variant.image_url); // ✅ Hiển thị ảnh variant
                   } else if (variant?.image) {
                     setSelectedImage(variant.image); // Fallback
                   } else if (color.image) {
                     setSelectedImage(color.image);
                   } else {
                     // ✅ Nếu không có variant, về ảnh chính
                     setSelectedImage(product.image_url || product.image || '');
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
          {/* Debug: Log category_id before passing to RelatedProducts */}
          {console.log('🔍 [ProductDetail DEBUG] product.category_id:', product.category_id)}
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
