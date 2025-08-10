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
  // **FIX: Ưu tiên giá biến thể, fallback sang giá sản phẩm**
  const currentPrice = selectedVariant?.price || product.price;
  
  // Lấy giá gốc: ưu tiên original_price, fallback sang old_price
  const originalPrice = product.original_price || (product as any).old_price;

  // ✅ Ưu tiên giá từ biến thể sản phẩm (variant), fallback về giá chính
  const displayPrice = selectedVariant?.price || product.price;

  // Format giá tiền VN - nhân 1000 để đồng bộ với hệ thống (nếu lưu giá theo nghìn)
  const formattedPrice = displayPrice
    ? Number(displayPrice * 1000).toLocaleString("vi-VN") + "đ"

    : "N/A";

  const formattedOldPrice = originalPrice
    ? Number(originalPrice).toLocaleString("vi-VN") + " VNĐ"
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
          {(() => {
            // Kiểm tra xem sản phẩm có variants nào còn hàng không
            const hasStock = product.variants?.some(variant => variant.stock > 0);
            
            if (hasStock) {
              return <span className="text-success fw-medium"> Còn hàng</span>;
            } else if (product.variants && product.variants.length > 0) {
              return <span className="text-danger fw-medium"> Hết hàng</span>;
            } else {
              // Nếu không có variants, kiểm tra stock của sản phẩm chính
              const productStock = (product as any).stock || 0;
              return productStock > 0 ? (
                <span className="text-success fw-medium"> Còn hàng</span>
              ) : (
                <span className="text-danger fw-medium"> Hết hàng</span>
              );
            }
          })()}
        </p>

        {/* Số lượng tồn kho */}
        <p className="mb-0">
          Số lượng:
          <span className="text-dark fw-medium">
            {" "}
            {(() => {
              if (selectedVariantStock !== null && selectedVariantStock !== undefined) {
                return selectedVariantStock;
              }
              
              // Nếu chưa chọn variant, hiển thị tổng số lượng có sẵn
              if (product.variants && product.variants.length > 0) {
                const totalStock = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
                return totalStock > 0 ? totalStock : "N/A";
              }
              
              // Nếu không có variants, hiển thị stock của sản phẩm chính
              const productStock = (product as any).stock || 0;
              return productStock > 0 ? productStock : "N/A";
            })()}
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
