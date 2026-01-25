import type { ProductInfoProps } from "../../../types/ProductInfoType";
import "../../../assets/styles/info.css";

// =============================
// Component hiển thị thông tin sản phẩm (tên, giá, trạng thái, mã SP...)
// =============================

const ProductInfo = ({
  product,
  selectedVariant,
  selectedVariantStock,
  sku,
}: ProductInfoProps) => {
  // Helper: tự động chuẩn hóa đơn vị VND. Nếu giá < 1000 coi là tính theo nghìn => nhân 1000
  const normalize = (v: any) => {
    const n = Number(v || 0);
    if (!isFinite(n)) return 0;
    return n < 1000 ? n * 1000 : n;
  };

  // Lấy thô: chỉ dùng price làm giá bán chuẩn (KHÔNG dùng final_price/discount)
  // Nếu variant.price không có hoặc = 0, fallback về product.price
  const rawPrice = (() => {
    const vp = Number((selectedVariant as any)?.price ?? 0);
    if (isFinite(vp) && vp > 0) return vp;
    return Number((product as any)?.price ?? 0);
  })();

  // Giá gốc: ưu tiên variant.original_price -> product.old_price (bỏ qua original_price để đúng chuẩn yêu cầu)
  const rawOriginal =
    (selectedVariant as any)?.original_price ??
    (product as any)?.old_price ??
    0;

  const priceN = normalize(rawPrice);
  const originalPrice = normalize(rawOriginal);

  // Chỉ coi là có giá gốc khi giá gốc hợp lệ (>0)
  const hasValidOriginal = originalPrice > 0;

  // Quy tắc:
  // - Luôn dùng price làm giá bán.
  // - Nếu có old_price hợp lệ và >= price thì hiển thị làm giá gốc (gạch).
  const salePrice = (() => {
    return priceN;
  })();
  // Cờ: có field giá gốc thực sự được cung cấp từ API/DB
  const hasOriginalField = hasValidOriginal;

  const formattedPrice = salePrice
    ? salePrice.toLocaleString("vi-VN") + "đ"
    : "N/A";

  const formattedOldPrice = originalPrice
    ? originalPrice.toLocaleString("vi-VN") + "đ"
    : "";

  const hasSelection = !!selectedVariant;

  return (
    <div className="product-info">
      {/* Tên sản phẩm */}
      <h3 className="fw-bold">{product.name}</h3>

      {/* Giá sản phẩm và giá gốc nếu có */}
      <div className="d-flex align-items-end gap-2 my-3">
        <h2 className="price-current text-danger fw-bolder mb-0">
          {formattedPrice}
        </h2>
        {hasOriginalField &&
          originalPrice > 0 &&
          originalPrice >= salePrice && (
            <span className="price-original">{formattedOldPrice}</span>
          )}
      </div>

      {/* Trạng thái kho, số lượng, đã bán, mã SP - luôn hiển thị label; nội dung chỉ hiện khi đã chọn variant */}
      <div className="mb-3">
        <p className="mb-1">
          Trạng thái:
          {hasSelection ? (
            selectedVariantStock && selectedVariantStock > 0 ? (
              <span className="text-success fw-medium"> Còn hàng</span>
            ) : (
              <span className="text-danger fw-medium"> Hết hàng</span>
            )
          ) : (
            <span className="text-muted"> Chọn Size + Màu</span>
          )}
        </p>

        {/* Số lượng tồn kho */}
        <p className="mb-0">
          Số lượng:
          {hasSelection ? (
            <span className="text-dark fw-medium"> {selectedVariantStock ?? "N/A"}</span>
          ) : (
            <span className="text-muted"> Chọn Size + Màu</span>
          )}
        </p>

        {/* Đã bán (theo sản phẩm) */}
        {product.sold !== undefined && (
          <p className="mb-0">
            Đã bán:
            {hasSelection ? (
              <span className="text-dark fw-medium"> {product.sold}</span>
            ) : (
              <span className="text-muted"> Chọn Size + Màu</span>
            )}
          </p>
        )}

        {/* Mã sản phẩm (SKU) */}
        <p className="mb-0 mt-1">
          Mã SP:
          {hasSelection && sku ? (
            <span className="text-dark fw-medium"> {sku}</span>
          ) : (
            <span className="text-muted"> Chọn Size + Màu</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ProductInfo;
