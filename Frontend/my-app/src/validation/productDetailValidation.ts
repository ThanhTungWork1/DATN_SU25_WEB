// Validation cho trang chi tiết sản phẩm
import type { ColorType } from '../types/DetailType';

/**
 * Kiểm tra đã chọn đủ size và màu khi thêm vào giỏ hàng
 * @param selectedSize - size được chọn
 * @param selectedColor - màu được chọn
 * @returns { valid: boolean, message: string }
 */
export function validateProductDetail(selectedSize: string | null, selectedColor: ColorType | null) {
  if (!selectedSize || !selectedColor) {
    return {
      valid: false,
      message: 'Vui lòng chọn đầy đủ Size và Màu sắc!'
    };
  }
  return { valid: true, message: '' };
} 