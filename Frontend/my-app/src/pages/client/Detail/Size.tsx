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
  /* Danh sách size hiển thị cố định (tuỳ chọn) */
  sizes?: string[];
  /* Xác định size có khả dụng hay không (tuỳ chọn) */
  isDisabled?: (size: string) => boolean;
};

const Size = ({ variants, selectedSize, onSelectSize, sizes, isDisabled }: SizeProps) => {
  const normalizeSize = (raw?: string | null): string | null => {
    if (!raw) return null;
    const token = raw.toUpperCase();
    const known = ["5XL", "2XL", "XL", "L", "M", "S"]; // thứ tự quan trọng (match 5XL trước 2XL, XL)
    for (const k of known) {
      if (token.includes(k)) return k;
    }
    return raw;
  };

  // Danh sách size để hiển thị: dùng sizes truyền vào hoặc suy ra từ variants
  const sizeList: string[] = sizes && sizes.length > 0
    ? sizes
    : ([
        ...new Set(
          variants
            .map((v) => normalizeSize(v.size?.name))
            .filter(Boolean) as string[]
        ),
      ]);

  // Không có size nào thì không hiển thị
  if (sizeList.length === 0) return null;

  return (
    <div className="mb-3">
      <label className="fw-bold">Size:</label>
      <div className="d-flex gap-2 flex-wrap mt-2">
        {sizeList.map((size) => {
          // Nếu truyền vào isDisabled thì dùng, ngược lại dựa vào tồn kho
          const disabledByProp = isDisabled ? isDisabled(size) : false;
          const outOfStock = !variants.some(
            (variant) => normalizeSize(variant?.size?.name) === size && (variant?.stock === undefined || variant?.stock === null || variant.stock > 0)
          );
          const isOutOfStock = disabledByProp || outOfStock;

          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              type="button"
              className={`btn btn-sm ${
                isSelected ? "btn-dark" : "btn-outline-secondary"
              }`}
              onClick={() => {
                if (!isOutOfStock) onSelectSize(size);
              }}
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
