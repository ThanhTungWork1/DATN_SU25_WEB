import { useState, useEffect } from "react";
import type { ColorType, Product } from "../types/DetailType";
import { useCart } from "../provider/CartProvider";
import { toast } from "sonner";
import { validateProductDetail } from "../validation/productDetailValidation";
import { addToCart as apiAddToCart } from "../api/ApiUrl";

export function useProductDetailLogic(product: Product | undefined) {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorType | null>(null);

  useEffect(() => {
    const initialImage =
      product?.image || (product?.images && product.images[0]) || "";
    setSelectedImage(initialImage);
    setSelectedSize(null);
    setSelectedColor(null);
  }, [product]);

  const handleAddToCart = async (quantity: number) => {
    if (!product) return;
    // Validate chọn size và màu
    const { valid, message } = validateProductDetail(
      selectedSize,
      selectedColor,
    );
    if (!valid) {
      toast.error(message);
      return;
    }
    const userId = Number(localStorage.getItem("userId"));
    if (!userId) {
      toast.error("Bạn cần đăng nhập để thêm vào giỏ hàng!");
      return;
    }
    // Tìm variantId đúng với màu và size
    const variant = product.variants?.find(
      (v) => v.size === selectedSize && v.color === selectedColor?.name
    );
    if (!variant) {
      toast.error("Không tìm thấy phiên bản sản phẩm phù hợp!");
      return;
    }
    await apiAddToCart(userId, variant.sku || variant.id, quantity);
    toast.success("Đã thêm sản phẩm vào giỏ hàng!");
  };

  const handleBuyNow = () => {
    // Logic mua ngay nếu cần
  };

  // Hàm xử lý chọn size (cho phép bỏ chọn)
  const handleSizeSelect = (size: string) => {
    setSelectedSize((prevSize) => (prevSize === size ? null : size));
  };

  // Hàm xử lý chọn màu (cho phép bỏ chọn)
  const handleColorSelect = (color: ColorType) => {
    setSelectedColor((prevColor) =>
      prevColor?.id === color.id ? null : color,
    );
  };

  return {
    selectedImage,
    setSelectedImage,
    selectedSize,
    selectedColor,
    handleAddToCart,
    handleBuyNow,
    handleSizeSelect, // Trả ra hàm mới
    handleColorSelect, // Trả ra hàm mới
  };
}
