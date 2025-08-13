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
    
    // Bắt buộc phải chọn đủ size và color, KHÔNG fallback tự động
    if (!selectedSize || !selectedColor) {
      toast.error("Vui lòng chọn đầy đủ Màu và Size trước khi thêm vào giỏ hàng!");
      return;
    }

    // Tìm đúng variant theo size/color đã chọn
    const targetVariant = (product.variants || []).find((variant: any) => 
      variant.size?.name === selectedSize && 
      variant.color?.id === selectedColor?.id
    );

    if (!targetVariant || !targetVariant.id) {
      toast.error("Không tìm thấy biến thể phù hợp (màu/size) cho sản phẩm này!");
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
    
    // Bắt buộc chọn đủ trước khi mua ngay
    if (!selectedSize || !selectedColor) {
      toast.error("Vui lòng chọn đầy đủ Màu và Size trước khi mua!");
      return;
    }

    const targetVariant = (product.variants || []).find((variant: any) => 
      variant.size?.name === selectedSize && 
      variant.color?.name === selectedColor?.name
    );

    if (!targetVariant || !targetVariant.id) {
      toast.error("Không tìm thấy biến thể phù hợp (màu/size) cho sản phẩm này!");
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
    // Toggle chọn/bỏ chọn size
    setSelectedSize((prevSize) => (prevSize === size ? null : size));

    // Không còn auto-gợi ý màu theo size; user phải tự chọn màu (trừ khi chỉ có 1 variant)
  };

  // Hàm xử lý chọn màu (cho phép bỏ chọn)
  const handleColorSelect = (color: ColorType) => {
    // Toggle chọn/bỏ chọn màu
    setSelectedColor((prevColor) => (prevColor?.id === color.id ? null : color));

    // Không còn auto-gợi ý size theo màu; user phải tự chọn size (trừ khi chỉ có 1 variant)
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
