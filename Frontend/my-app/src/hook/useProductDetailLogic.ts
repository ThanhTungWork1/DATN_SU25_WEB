import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Product } from "../types/DetailType";
import type { ColorType } from "../types/ColorType"; // Sửa đường dẫn import
import { useCart } from "../provider/CartProvider";
import { validateProductDetail } from "../validation/productDetailValidation"; // Sửa đường dẫn import

export const useProductDetailLogic = (product: Product | undefined) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorType | null>(null);

  useEffect(() => {
    if (!product) return;
    const initialImage =
      product.image_url ||
      (product.variants && product.variants[0]?.image_url) ||
      (product.images && product.images[0]) ||
      product.image ||
      "";
    setSelectedImage(initialImage);

    setSelectedSize(null);
    setSelectedColor(null);
  }, [product]);

  const handleAddToCart = async (quantity: number) => {
    console.log("--- [LOGIC V3] Bắt đầu handleAddToCart ---");
    if (!product) return;

    const { valid, message } = validateProductDetail(selectedSize, selectedColor);
    if (!valid) {
      toast.error(message);
      return;
    }

    const selectedVariant = product.variants?.find(
      (v) => v.size?.name === selectedSize && v.color?.id === selectedColor?.id
    );

    if (!selectedVariant) {
      toast.error("Không tìm thấy biến thể sản phẩm phù hợp.");
      return;
    }

    const payload = {
      id: selectedVariant.id, // Yêu cầu của CartProvider
      name: product.name, // Yêu cầu của CartProvider
      product_id: product.id,
      variant_id: selectedVariant.id,
      quantity: quantity,
      price: selectedVariant.price || product.price,
      image: selectedImage || product.image_url || "", // Thêm ảnh để hiển thị trong giỏ hàng
    };

    console.log("--- [LOGIC V3] Dữ liệu gửi đi ---", payload);
    await addToCart(payload);
  };

  const handleBuyNow = (quantity: number) => {
    if (!product) return;

    const { valid, message } = validateProductDetail(selectedSize, selectedColor);
    if (!valid) {
      toast.error(message);
      return;
    }

    const selectedVariant = product.variants?.find(
      (v) => v.size?.name === selectedSize && v.color?.id === selectedColor?.id
    );

    if (!selectedVariant) {
      toast.error("Không tìm thấy biến thể sản phẩm phù hợp.");
      return;
    }

    const itemToCheckout = {
      id: product.id,
      name: product.name,
      price: selectedVariant.price || product.price,
      quantity: quantity,
      image: selectedImage || product.image_url || "",
      variant_id: selectedVariant.id,
      product_id: product.id,
    };

    const totalAmount = itemToCheckout.price * quantity;

    navigate("/checkout", {
      state: {
        selectedProducts: [itemToCheckout],
        totalAmount: totalAmount,
        fromBuyNow: true,
      },
    });
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize((prevSize) => (prevSize === size ? null : size));
  };

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
};
