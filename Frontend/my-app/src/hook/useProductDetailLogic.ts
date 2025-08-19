import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Product } from "../types/DetailType";
import type { ColorType } from "../types/ColorType"; // Sửa đường dẫn import
import type { CartItem } from "../types/CartType";
import { useCart } from "../provider/CartProvider";
import { validateProductDetail } from "../validation/productDetailValidation"; // Sửa đường dẫn import

export const useProductDetailLogic = (product: Product | undefined) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorType | null>(null);

  useEffect(() => {
    if (product) {
        // Ưu tiên ảnh của biến thể đầu tiên, nếu không có thì lấy ảnh chính của sản phẩm
        const initialImage = product.variants?.[0]?.image_url || product.image_url || "";
        setSelectedImage(initialImage);

        // Thiết lập các lựa chọn biến thể ban đầu
        if (product.variants && product.variants.length > 0) {
            const firstVariant = product.variants[0];
            setSelectedSize(firstVariant.size?.name || '');
            setSelectedColor(firstVariant.color || null);
        } else {
            // Reset nếu không có biến thể
            setSelectedSize(null);
            setSelectedColor(null);
        }
    }
  }, [product]);

  const handleAddToCart = async (quantity: number) => {
    if (!product) return;

    const { valid, message } = validateProductDetail(selectedSize, selectedColor);
    if (!valid) {
      toast.error(message);
      return;
    }

    const selectedVariant = product.variants?.find(
      (v) => v.size?.name === selectedSize && v.color?.id === selectedColor?.id
    );

    console.log("[DEBUG] Biến thể được chọn khi thêm vào giỏ hàng:", selectedVariant);

    if (
      !selectedVariant ||
      !selectedVariant.color ||
      !selectedVariant.color.hex_code ||
      !selectedVariant.size
    ) {
      toast.error(
        "Không tìm thấy biến thể sản phẩm phù hợp hoặc dữ liệu biến thể không đầy đủ."
      );
      return;
    }

    const payload: CartItem = {
      id: selectedVariant.id, // ID tạm thời, sẽ được ghi đè bởi ID của cart_item từ backend
      name: product.name,
      price: selectedVariant.price || product.price,
      quantity: quantity,
      product_variant_id: selectedVariant.id,
      product_variant: {
        id: selectedVariant.id,
        color: {
          id: selectedVariant.color.id,
          name: selectedVariant.color.name,
          hex_code: selectedVariant.color.hex_code, // TypeScript giờ đã biết đây là string
        },
        size: {
          id: selectedVariant.size.id,
          name: selectedVariant.size.name,
        },
        product: {
          id: product.id,
          name: product.name,
        },
      },
    };

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
