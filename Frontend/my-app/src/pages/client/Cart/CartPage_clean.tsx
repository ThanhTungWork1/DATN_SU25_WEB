import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../../../hook/useCart";

interface CartItem {
  id: number;
  quantity: number;
  variant: {
    id: number;
    price: number;
    product: {
      id: number;
      name: string;
      image_url?: string;
    };
    color: { name: string };
    size: { name: string };
  };
}

const CartPage = () => {
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();
  const { cartData, loading, updateQuantity, removeItem, clearCart } = useCart(token);

  const [selectedItems, setSelectedItems] = useState<{ [key: number]: boolean }>({});
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  const cartItems = cartData?.items || [];

  // Tự động chọn tất cả sản phẩm khi cartData thay đổi
  useEffect(() => {
    if (cartItems.length === 0) return;
    
    const allSelected = cartItems.reduce((acc: { [key: number]: boolean }, item: CartItem) => {
      acc[item.id] = true;
      return acc;
    }, {} as { [key: number]: boolean });
    setSelectedItems(allSelected);
    
    // Khởi tạo quantities từ cartData
    const initialQuantities = cartItems.reduce((acc: { [key: number]: number }, item: CartItem) => {
      acc[item.id] = item.quantity;
      return acc;
    }, {} as { [key: number]: number });
    setQuantities(initialQuantities);
  }, [cartData]);

  const toggleSelectItem = (id: number) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [id]: quantity }));
  };

  const onSubmit = () => {
    Object.keys(quantities).forEach((idStr) => {
      const id = Number(idStr);
      const quantity = quantities[id];
      if (quantity > 0) updateQuantity(id, quantity);
    });
  };

  const selectedProducts = cartItems.filter((item: CartItem) => selectedItems[item.id]).map((item: CartItem) => ({
    ...item,
    quantity: quantities[item.id] || item.quantity
  }));
  
  const totalAmount = selectedProducts.reduce(
    (total: number, item: any) => total + (item.variant.price * 1000) * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2 className="fw-bold text-center">🛒 Giỏ hàng của bạn</h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">Giỏ hàng trống.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="row">
            <div className="col-lg-8">
              {cartItems.map((item: CartItem) => (
                <div key={item.id} className="d-flex align-items-center border-bottom py-3">
                  <input
                    type="checkbox"
                    className="form-check-input me-3"
                    checked={selectedItems[item.id] || false}
                    onChange={() => toggleSelectItem(item.id)}
                  />
                  <img
                    src={item.variant.product.image_url || '/placeholder-image.jpg'}
                    alt={item.variant.product.name}
                    className="img-thumbnail me-3"
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  />
                  <div className="flex-grow-1">
                    <h5 className="mb-1">{item.variant.product.name}</h5>
                    <p className="text-muted mb-1">
                      Màu: {item.variant.color.name} | Size: {item.variant.size.name}
                    </p>
                    <p className="fw-bold text-danger mb-0">
                      {(item.variant.price * 1000).toLocaleString()} VND
                    </p>
                  </div>
                  <div className="d-flex align-items-center">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleQuantityChange(item.id, Math.max(1, quantities[item.id] - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="form-control mx-2 text-center"
                      style={{ width: "60px" }}
                      value={quantities[item.id] || item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                      min="1"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleQuantityChange(item.id, quantities[item.id] + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm ms-3"
                    onClick={() => removeItem(item.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            <div className="col-lg-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Tóm tắt đơn hàng</h5>
                  <div className="d-flex justify-content-between">
                    <span>Sản phẩm đã chọn:</span>
                    <span>{selectedProducts.length}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Tổng tiền:</span>
                    <span className="fw-bold text-danger">
                      {totalAmount.toLocaleString()} VND
                    </span>
                  </div>
                  <hr />
                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-success">
                      Cập nhật giỏ hàng
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => navigate('/checkout')}
                      disabled={selectedProducts.length === 0}
                    >
                      Thanh toán ({selectedProducts.length} sản phẩm)
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={clearCart}
                    >
                      Xóa tất cả
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CartPage;
