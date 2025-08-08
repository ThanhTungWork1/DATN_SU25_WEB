import { useState, useEffect } from "react";
import type { ColorType, Product } from "../types/DetailType";
import { useCart } from "../provider/CartProvider";
import { toast } from "sonner";
import { validateProductDetail } from "../validation/productDetailValidation";
import axios from "axios";

export function useProductDetailLogic(product: Product | undefined) {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorType | null>(null);

  useEffect(() => {
    if (!product) return;
    
    const initialImage =
      product?.image || (product?.images && product.images[0]) || "";
    setSelectedImage(initialImage);
    
    // Reset selections when product changes
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
    // Tìm đúng variant
    const variant = product.variants?.find(
      (v) =>
        v.size?.name === selectedSize && v.color?.id === selectedColor?.id
    );
    if (!variant) {
      toast.error("Không tìm thấy biến thể sản phẩm phù hợp!");
      return;
    }
    const { TokenManager } = await import("../utils/tokenUtils");
    const token = TokenManager.getUserToken();
    if (!token) {
      toast.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }
    try {
      // **FIX: Sử dụng variant.price thay vì product.price**
      const variantPrice = variant.price || product.price; // Fallback nếu variant không có giá
      const finalPrice = product.discount && product.discount > 0 && product.discount < 100
        ? Math.max(0, Math.round(variantPrice * (1 - product.discount / 100)))
        : variantPrice;

      // Debug: log dữ liệu gửi đi
      console.log("Gửi request thêm giỏ hàng:", {
        cartItems: [
          {
            variant_id: variant.id,
            quantity,
            price: finalPrice,
            debug: {
              variant_price: variant.price,
              product_price: product.price,
              final_price: finalPrice,
              discount: product.discount
            }
          },
        ],
      });
      const response = await axios.post(
        "http://localhost:8000/api/cart",
        {
          cartItems: [
            {
              variant_id: variant.id,
              quantity,
              price: finalPrice,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Đã thêm sản phẩm vào giỏ hàng!");
      // Debug: log response backend
      console.log("Kết quả thêm giỏ hàng:", response.data);
      // Có thể gọi lại hàm lấy giỏ hàng để cập nhật giao diện nếu muốn
    } catch (error: any) {
      // Hiện lỗi chi tiết nếu có
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Thêm sản phẩm vào giỏ hàng thất bại!");
      }
      console.error("Lỗi thêm giỏ hàng:", error);
    }
  };

  const handleBuyNow = () => {
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
    // Tìm đúng variant
    const variant = product.variants?.find(
      (v) =>
        v.size?.name === selectedSize && v.color?.id === selectedColor?.id
    );
    if (!variant) {
      toast.error("Không tìm thấy biến thể sản phẩm phù hợp!");
      return;
    }
    const fallbackImage =
      product.image || (product.images && product.images[0]) || "";
    // **FIX: Sử dụng variant.price thay vì product.price**
    const variantPrice = variant.price || product.price;
    const finalPrice = product.discount && product.discount > 0 && product.discount < 100
      ? Math.max(0, Math.round(variantPrice * (1 - product.discount / 100)))
      : variantPrice;

    addToCart({
      id: product.id,
      product_id: product.id,
      variant_id: variant.id,
      name: product.name,
      price: finalPrice,
      image: selectedImage || fallbackImage,
      quantity: 1,
      color: selectedColor!.name,
      size: selectedSize!,
    });
    window.location.href = '/checkout';
  };

  // Hàm xử lý chọn size (không cho phép bỏ chọn)
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  // Hàm xử lý chọn màu (không cho phép bỏ chọn)
  const handleColorSelect = (color: ColorType) => {
    setSelectedColor(color);
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