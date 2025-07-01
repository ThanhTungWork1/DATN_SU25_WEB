// Validation cho trang chi tiết sản phẩm
<<<<<<< HEAD
<<<<<<< HEAD
import type { ColorType } from "../types/DetailType";
=======
import type { ColorType } from '../types/DetailType';
>>>>>>> b255043f (Hoàn thiện chi tiết sản phẩm 70%, chưa có validate)
=======
import type { ColorType } from "../types/DetailType";
>>>>>>> a8244187 (giao dien list sp)

/**
 * Kiểm tra đã chọn đủ size và màu khi thêm vào giỏ hàng
 * @param selectedSize - size được chọn
 * @param selectedColor - màu được chọn
 * @returns { valid: boolean, message: string }
 */
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> a8244187 (giao dien list sp)
export function validateProductDetail(
  selectedSize: string | null,
  selectedColor: ColorType | null,
) {
<<<<<<< HEAD
  if (!selectedSize || !selectedColor) {
    return {
      valid: false,
      message: "Vui lòng chọn đầy đủ Size và Màu sắc!",
    };
  }
  return { valid: true, message: "" };
}
=======
export function validateProductDetail(selectedSize: string | null, selectedColor: ColorType | null) {
=======
>>>>>>> a8244187 (giao dien list sp)
  if (!selectedSize || !selectedColor) {
    return {
      valid: false,
      message: "Vui lòng chọn đầy đủ Size và Màu sắc!",
    };
  }
<<<<<<< HEAD
  return { valid: true, message: '' };
} 
>>>>>>> b255043f (Hoàn thiện chi tiết sản phẩm 70%, chưa có validate)
=======
  return { valid: true, message: "" };
}
>>>>>>> a8244187 (giao dien list sp)
