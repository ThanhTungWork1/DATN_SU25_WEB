import type { Variant } from "../../../types/DetailType";

/*
 * =================================================================
 * COMPONENT HIỂN THỊ LỰA CHỌN SIZE (Size) - PHIÊN BẢN CẢI TIẾN
 * =================================================================
 */
type SizeProps = {
  /* Mảng chứa tất cả các biến thể của sản phẩm */
  variants: Variant[];
  /* Size hiện tại đang được người dùng chọn */
  selectedSize: string | null;
  /* Hàm callback để thông báo cho component cha khi người dùng chọn 1 size */
  onSelectSize: (size: string) => void;
};

const Size = ({ variants, selectedSize, onSelectSize }: SizeProps) => {
  /*
   * =================================================================
   * GỠ LỖI: In ra prop 'variants' mà component này nhận được
   * =================================================================
   */
  console.log("[DEBUG] Component 'Size' nhận được variants:", variants);

  /*
   * BƯỚC 1: LẤY DANH SÁCH SIZE DUY NHẤT
   * Lọc ra các size hợp lệ (không phải null hay undefined) và không trùng lặp.
   */
  const availableSizes = [
    ...new Set(variants.map((v) => v.size).filter(Boolean) as string[]),
  ];

  /* Nếu không có size nào hợp lệ, không render component này. */
  if (availableSizes.length === 0) {
    return null;
  }

  return (
    <div className="mb-3">
      <label className="fw-bold">Size:</label>
      <div className="d-flex gap-2 flex-wrap mt-2">
        {/* BƯỚC 2: RENDER CÁC NÚT CHỌN SIZE */}
        {availableSizes.map((size) => {
          /*
           * BƯỚC 3: KIỂM TRA TÌNH TRẠNG KHO HÀNG (QUAN TRỌNG)
           * - Dùng hàm `some` để kiểm tra xem có "ít nhất một"
           *   biến thể nào có cùng `size` này VÀ còn hàng (`stock > 0`) không.
           * - Nếu không tìm thấy cái nào (`!variants.some(...)`),
           *   có nghĩa là size này đã hết hàng trên mọi phiên bản màu.
           */
          const isOutOfStock = !variants.some(
            (variant) =>
              variant?.size === size && variant?.stock && variant.stock > 0,
          );

          /* Kiểm tra xem size này có đang được người dùng chọn hay không */
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              type="button"
              className={`btn btn-sm ${isSelected ? "btn-dark" : "btn-outline-secondary"}`}
              onClick={() => onSelectSize(size)}
              /* Vô hiệu hóa nút nếu size này đã hết hàng */
              disabled={isOutOfStock}
              /* Thêm tooltip để người dùng biết tại sao nút bị vô hiệu hóa */
              title={isOutOfStock ? "Hết hàng" : `Chọn size ${size}`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Size;
