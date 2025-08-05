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
  // Lấy giá gốc: ưu tiên original_price, fallback sang old_price
  const originalPrice = product.original_price || (product as any).old_price;

  // ✅ Ưu tiên giá từ biến thể sản phẩm (variant), fallback về giá chính
  const displayPrice = selectedVariant?.price || product.price;

  // Format giá tiền VN - nhân 1000 để đồng bộ với hệ thống (nếu lưu giá theo nghìn)
  const formattedPrice = displayPrice
    ? Number(displayPrice * 1000).toLocaleString("vi-VN") + "đ"
    : "N/A";

  const formattedOldPrice = originalPrice
    ? Number(originalPrice * 1000).toLocaleString("vi-VN") + "đ"
    : "";

  return (
    <div className="product-info">
      {/* Tên sản phẩm */}
      <h3 className="fw-bold">{product.name}</h3>

      {/* Giá sản phẩm và giá gốc nếu có */}
      <div className="d-flex align-items-end gap-2 my-3">
        <h2 className="text-danger fw-bolder mb-0">{formattedPrice}</h2>
        {originalPrice && Number(originalPrice) > Number(displayPrice) && (
          <span className="price-original">{formattedOldPrice}</span>
        )}
      </div>

      {/* Trạng thái kho, số lượng, đã bán, mã SP */}
      <div className="mb-3">
        <p className="mb-1">
          Trạng thái:
          {selectedVariantStock !== null &&
          selectedVariantStock !== undefined ? (
            selectedVariantStock > 0 ? (
              <span className="text-success fw-medium"> Còn hàng</span>
            ) : (
              <span className="text-danger fw-medium"> Hết hàng</span>
            )
          ) : (
            <span className="text-muted"> Vui lòng chọn Size / Màu</span>
          )}
        </p>

        {/* Số lượng tồn kho */}
        <p className="mb-0">
          Số lượng:
          <span className="text-dark fw-medium">
            {" "}
            {selectedVariantStock ?? "N/A"}
          </span>
        </p>

        {/* Đã bán */}
        {product.sold !== undefined && (
          <p className="mb-0">
            Đã bán:
            <span className="text-dark fw-medium"> {product.sold}</span>
          </p>
        )}

        {/* Mã sản phẩm (SKU) */}
        {sku && (
          <p className="mb-0 mt-1">
            Mã SP:
            <span className="text-dark fw-medium"> {sku}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;
