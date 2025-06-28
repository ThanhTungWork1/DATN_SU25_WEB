import type { ProductInfoProps } from "../../../types/ProductInfoType";

// =============================
// Component hiển thị thông tin sản phẩm (tên, giá, trạng thái, mã SP...)
// =============================

const ProductInfo = ({
  product,
  selectedVariantStock,
  sku,
}: ProductInfoProps) => {
  // Lấy giá gốc: ưu tiên original_price, fallback sang old_price
  const originalPrice = product.original_price || (product as any).old_price;
  return (
    <div className="product-info">
      {/* Tên sản phẩm */}
      <h3 className="fw-bold">{product.name}</h3>

      {/* Giá sản phẩm và giá gốc nếu có */}
      <div className="d-flex align-items-end gap-2 my-3">
        <h2 className="text-danger fw-bolder mb-0">
          {product.price.toLocaleString()}đ
        </h2>
        {/* Hiển thị giá gốc nếu có và lớn hơn giá bán */}
        {originalPrice && originalPrice > product.price && (
          <span className="price-original">
            {originalPrice.toLocaleString()}đ
          </span>
        )}
      </div>

      {/* Trạng thái kho, số lượng, đã bán, mã SP */}
      <div className="mb-3">
        {/* Trạng thái còn hàng/hết hàng hoặc yêu cầu chọn size/màu */}
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
