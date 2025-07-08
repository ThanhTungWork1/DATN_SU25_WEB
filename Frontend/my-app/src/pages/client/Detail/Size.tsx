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
  // DEBUG: In ra danh sách variants để kiểm tra dữ liệu
  console.log("[DEBUG] Component 'Size' nhận được variants:", variants);

  // BƯỚC 1: Lọc ra các size duy nhất và hợp lệ
  const availableSizes = [
    ...new Set(variants.map((v) => v.size).filter(Boolean) as string[]),
  ];

  // Không có size nào hợp lệ thì không hiển thị
  if (availableSizes.length === 0) return null;

  return (
    <div className="mb-3">
      <label className="fw-bold">Size:</label>
      <div className="d-flex gap-2 flex-wrap mt-2">
        {availableSizes.map((size) => {
          // Kiểm tra xem size này có còn hàng không
          const isOutOfStock = !variants.some(
            (variant) =>
              variant?.size === size && variant?.stock && variant.stock > 0
          );

          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              type="button"
              className={`btn btn-sm ${
                isSelected ? "btn-dark" : "btn-outline-secondary"
              }`}
              onClick={() => onSelectSize(size)}
              disabled={isOutOfStock}
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
