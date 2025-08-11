import { useState, useEffect } from "react";
import type { Product } from "../types/DetailType";
import type { ColorType } from "../types/ColorType";
import { useCart } from "../provider/CartProvider";
import { toast } from "sonner";
import { validateProductDetail } from "../validation/productDetailValidation";
import { useNavigate } from "react-router-dom";

export function useProductDetailLogic(product: Product | undefined) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorType | null>(null);

  useEffect(() => {
    // ✅ Sửa lại logic: ưu tiên sử dụng image_url từ backend
    const initialImage =
      product?.image_url || // ✅ Ưu tiên image_url
      product?.image || // Fallback cho image path
      (product?.images && product.images[0]) ||
      "";
    setSelectedImage(initialImage);
    setSelectedSize(null);
    setSelectedColor(null);
  }, [product]);

  const handleAddToCart = (quantity: number) => {
    if (!product) return;
    
    console.log('=== ADD TO CART START ===');
    console.log('Product:', product);
    console.log('Selected Size:', selectedSize);
    console.log('Selected Color:', selectedColor);
    
    // ✅ LOGIC ĐÚNG: Tìm variant dựa trên size/color user đã chọn
    let targetVariant = null;
    
    // Nếu user đã chọn size và color
    if (selectedSize && selectedColor && product.variants) {
      targetVariant = product.variants.find((variant: any) => 
        variant.size?.name === selectedSize && 
        variant.color?.name === selectedColor?.name
      );
      console.log('🎯 Found variant by size/color:', targetVariant);
    }
    
    // Nếu không tìm thấy variant chính xác, lấy variant đầu tiên
    if (!targetVariant && product.variants && product.variants.length > 0) {
      targetVariant = product.variants[0];
      console.log('⚠️ Using first variant as fallback:', targetVariant);
    }
    
    // Nếu vẫn không có variant, báo lỗi
    if (!targetVariant || !targetVariant.id) {
      toast.error("Không tìm thấy variant hợp lệ cho sản phẩm!");
      return;
    }
    
    console.log('✅ Final variant to add:', targetVariant);
    
    addToCart({
      product_id: product.id,
      variant_id: targetVariant.id,
      quantity,
      price: targetVariant.price || product.price,
    });
    
    const sizeName = targetVariant.size?.name || 'N/A';
    const colorName = targetVariant.color?.name || 'N/A';
    toast.success(`Đã thêm ${colorName} - ${sizeName} vào giỏ hàng!`);
  };

  const handleBuyNow = (quantity: number) => {
    if (!product) return;
    
    // ✅ LOGIC ĐÚNG: Tìm variant dựa trên size/color user đã chọn
    let targetVariant = null;
    
    // Nếu user đã chọn size và color
    if (selectedSize && selectedColor && product.variants) {
      targetVariant = product.variants.find((variant: any) => 
        variant.size?.name === selectedSize && 
        variant.color?.name === selectedColor?.name
      );
    }
    
    // Nếu không tìm thấy variant chính xác, lấy variant đầu tiên
    if (!targetVariant && product.variants && product.variants.length > 0) {
      targetVariant = product.variants[0];
    }
    
    // Nếu vẫn không có variant, báo lỗi
    if (!targetVariant || !targetVariant.id) {
      toast.error("Không tìm thấy variant hợp lệ cho sản phẩm!");
      return;
    }

    const item = {
      product_id: product.id,
      variant_id: targetVariant.id,
      quantity,
      price: targetVariant.price || product.price,
    };
    
    addToCart(item);
    toast.success("Đã thêm sản phẩm vào giỏ hàng!");
    
    // Chuyển sang trang thanh toán
    navigate("/checkout");
  };

  // Hàm xử lý chọn size (cho phép bỏ chọn)
  const handleSizeSelect = (size: string) => {
    setSelectedSize((prevSize) => (prevSize === size ? null : size));
  };

  // Hàm xử lý chọn màu (cho phép bỏ chọn)
  const handleColorSelect = (color: ColorType) => {
    setSelectedColor((prevColor) =>
      prevColor?.id === color.id ? null : color
    );
  };

  return {
    selectedImage,
    setSelectedImage,
    selectedSize,
    selectedColor,
    handleAddToCart,
    handleBuyNow,
    handleSizeSelect,
    handleColorSelect,
  };
}
