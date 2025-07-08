import { useState } from "react";

/**
 * Custom hook điều khiển số lượng sản phẩm (quantity).
 * - Đảm bảo không vượt quá giới hạn tối đa (max).
 * - Không được nhỏ hơn 1.
 */
export function useQuantityControl(max: number) {
  const [quantity, setQuantity] = useState(1);

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => Math.min(max, prev + 1));
  };

  const handleInputChange = (value: string) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return;
    if (parsed < 1) return setQuantity(1);
    if (parsed > max) return setQuantity(max);
    setQuantity(parsed);
  };

  return {
    quantity,
    handleDecrease,
    handleIncrease,
    handleInputChange,
  };
}
