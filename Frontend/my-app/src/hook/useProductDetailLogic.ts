import { useState, useEffect } from "react";
import type { ColorType, Product } from "../types/DetailType";
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
    const initialImage =
      product?.image || (product?.images && product.images[0]) || "";
    setSelectedImage(initialImage);
    setSelectedSize(null);
    setSelectedColor(null);
  }, [product]);

  const handleAddToCart = (quantity: number) => {
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
    addToCart({
      product_id: product.id,
      quantity,
      price:
        product.discount && product.discount > 0 && product.discount < 100
          ? Math.max(
              0,
              Math.round(product.price * (1 - product.discount / 100)),
            )
          : product.price,
    });
    toast.success("Đã thêm sản phẩm vào giỏ hàng!");
  };

  const handleBuyNow = (quantity: number) => {
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
    const item = {
      product_id: product.id,
      quantity,
      price:
        product.discount && product.discount > 0 && product.discount < 100
          ? Math.max(
              0,
              Math.round(product.price * (1 - product.discount / 100)),
            )
          : product.price,
    };
    addToCart(item);
    toast.success("Đã thêm sản phẩm vào giỏ hàng!");
    // Chuyển sang trang thanh toán, truyền sản phẩm vừa chọn
    navigate("/checkout", {
      state: {
        selectedProducts: [item],
        totalAmount: item.price * item.quantity,
      },
    });
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
