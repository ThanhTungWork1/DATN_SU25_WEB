import { useState, useEffect } from 'react';
import type { ColorType, Product } from '../../../types/DetailType';
import { useCart } from '../../../provider/CartProvider';

export function useProductDetailLogic(product: Product | undefined) {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorType | null>(null);

  useEffect(() => {
    if (product?.images?.length) setSelectedImage(product.images[0]);
    else setSelectedImage('');
    setSelectedSize(null);
    setSelectedColor(null);
  }, [product]);

  const handleAddToCart = (quantity: number) => {
    if (!product) return;
    if (!selectedSize || !selectedColor) {
      alert('Vui lòng chọn size và màu!');
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.discount && product.discount > 0 && product.discount < 100
        ? Math.max(0, Math.round(product.price * (1 - product.discount / 100)))
        : product.price,
      image: selectedImage || product.images[0] || '',
      quantity,
      color: selectedColor.name,
      size: selectedSize,
    });
    alert('Đã thêm vào giỏ hàng!');
  };

  const handleBuyNow = () => {
    // Logic mua ngay nếu cần
  };

  return {
    selectedImage, setSelectedImage,
    selectedSize, setSelectedSize,
    selectedColor, setSelectedColor,
    handleAddToCart, handleBuyNow
  };
} 