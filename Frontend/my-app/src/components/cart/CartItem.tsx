import type { CartItem as CartItemType } from "../../types/CartType"; // Sử dụng type chung

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {

  // Lấy thông tin màu và size từ product_variant
  const color = item.product_variant?.color;
  const size = item.product_variant?.size;
  const image = item.product_variant?.image_url || item.product_variant?.product?.image_url || 'https://via.placeholder.com/80';

  return (
    <div className="d-flex align-items-center border-bottom py-2">
      <img src={image} alt={item.name} className="img-thumbnail" width={80} />
      <div className="ms-3 flex-grow-1">
        <h5>{item.name}</h5>
        
        {/* Hiển thị Size và Color */}
        <div className="d-flex align-items-center my-1">
          {size && <span className="me-3">Size: {size.name}</span>}
          {color && (
            <div className="d-flex align-items-center">
              <span className="me-2">Màu:</span>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: color.hex_code,
                  border: "1px solid #ccc",
                  borderRadius: "50%",
                }}
                title={color.name} // Tooltip hiển thị tên màu
              ></div>
            </div>
          )}
        </div>

        <p className="mb-0">{Math.round(item.price).toLocaleString('vi-VN')} VND</p>
      </div>
      <input
        type="number"
        min="1"
        value={item.quantity}
        className="form-control mx-2" style={{ width: '70px' }}
        onChange={(e) => {
          const newQuantity = Number(e.target.value);
          if (newQuantity > 0) {
            onUpdateQuantity(item.id, newQuantity);
          }
        }}
      />
      <p className="fw-bold mx-3" style={{ minWidth: '120px', textAlign: 'right' }}>
        {Math.round(item.price * item.quantity).toLocaleString('vi-VN')} VND
      </p>
      <button type="button" onClick={() => onRemove(item.id)} className="btn btn-danger ms-3">
        Xóa
      </button>
    </div>
  );
};

export default CartItem;
