import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../provider/CartProvider";
import CartItem from "../../../components/cart/CartItem"; // Import component CartItem
import { toast } from "sonner";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart, fetchCart } = useCart();

  // DEBUG: Log cartItems để kiểm tra dữ liệu
  useEffect(() => {
    if (cartItems.length > 0) {
      console.log("Dữ liệu giỏ hàng hiện tại:", cartItems);
    }
  }, [cartItems]);

  const [selectedItems, setSelectedItems] = useState<{ [key: number]: boolean }>({});

  // Tự động chọn tất cả sản phẩm khi cartItems thay đổi
  useEffect(() => {
    const allSelected = cartItems.reduce((acc, item) => {
      acc[item.id] = true;
      return acc;
    }, {} as { [key: number]: boolean });
    setSelectedItems(allSelected);
  }, [cartItems]);

  // Đảm bảo đồng bộ lần đầu mở trang
  useEffect(() => {
    fetchCart?.();
  }, []);

  const toggleSelectItem = (id: number) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateSelectedQuantities = () => {
    const updates = cartItems
      .filter(item => selectedItems[item.id])
      .map(item => updateQuantity(item.id, item.quantity));

    Promise.all(updates)
      .then(() => {
        toast.success("Đã cập nhật giỏ hàng!");
        fetchCart?.(); // Tải lại để đảm bảo đồng bộ
      })
      .catch(() => toast.error("Có lỗi xảy ra khi cập nhật giỏ hàng."));
  };

  const selectedProducts = cartItems.filter((item) => selectedItems[item.id]);
  const shippingFee = 30000;
  const subtotalAmount = selectedProducts.reduce(
    (total, item) => total + item.price * 1000 * item.quantity,
    0
  );
  const totalAmount = subtotalAmount + shippingFee;

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-dark mb-2">
            <i className="fas fa-shopping-cart text-primary me-3"></i>
            Giỏ hàng của bạn
          </h1>
          <p className="text-muted fs-5">Xem lại các sản phẩm bạn đã chọn</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-4">
              <i className="fas fa-shopping-cart text-muted" style={{ fontSize: '5rem' }}></i>
            </div>
            <h3 className="text-muted mb-3">Giỏ hàng trống</h3>
            <p className="text-muted mb-4">Hãy thêm một số sản phẩm vào giỏ hàng của bạn</p>
            <button 
              className="btn btn-primary btn-lg px-4 py-2"
              onClick={() => navigate('/products')}
            >
              <i className="fas fa-shopping-bag me-2"></i>
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateSelectedQuantities(); }}>
            <div className="row g-4">
              {/* Danh sách sản phẩm */}
              <div className="col-lg-8">
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-white border-0 py-3">
                    <h5 className="mb-0 fw-bold">
                      <i className="fas fa-list-ul text-primary me-2"></i>
                      Sản phẩm ({cartItems.length})
                    </h5>
                  </div>
                  <div className="card-body p-0">
                    {cartItems.map((item, index) => (
                      <div key={item.id} className={`d-flex align-items-center p-3 ${index !== cartItems.length - 1 ? 'border-bottom' : ''}`}>
                        <div className="form-check me-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`item-${item.id}`}
                            checked={selectedItems[item.id] || false}
                            onChange={() => toggleSelectItem(item.id)}
                            style={{ transform: 'scale(1.2)' }}
                          />
                        </div>
                        <div className="flex-grow-1">
                           {/* Sử dụng component CartItem đã được chuẩn hóa */}
                          <CartItem 
                            item={item} 
                            onUpdateQuantity={(id, quantity) => updateQuantity(id, quantity)}
                            onRemove={(id) => removeFromCart(id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="card-footer bg-white border-0 py-3">
                    <button type="submit" className="btn btn-outline-primary">
                      <i className="fas fa-sync-alt me-2"></i>
                      Cập nhật giỏ hàng
                    </button>
                  </div>
                </div>
              </div>

              {/* Tóm tắt đơn hàng */}
              <div className="col-lg-4">
                <div className="card shadow-sm border-0 sticky-top" style={{ top: '20px' }}>
                  <div className="card-header bg-primary text-white py-3">
                    <h5 className="mb-0 fw-bold">
                      <i className="fas fa-receipt me-2"></i>
                      Tóm tắt đơn hàng
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between mb-3">
                      <span>Số sản phẩm đã chọn:</span>
                      <span className="fw-bold">{selectedProducts.length}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span>Tạm tính:</span>
                      <span className="fw-bold">{subtotalAmount.toLocaleString('vi-VN')} VND</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span>Phí vận chuyển:</span>
                      <span className="fw-bold">{shippingFee.toLocaleString('vi-VN')} VND</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-4">
                      <span className="fs-5 fw-bold">Tổng cộng:</span>
                      <span className="fs-4 fw-bold text-danger">{totalAmount.toLocaleString('vi-VN')} VND</span>
                    </div>

                    <button
                      className="btn btn-success w-100 mb-3 py-2"
                      type="button"
                      onClick={() =>
                        navigate("/checkout", {
                          state: { selectedProducts, totalAmount: subtotalAmount },
                        })
                      }
                      disabled={selectedProducts.length === 0}
                    >
                      <i className="fas fa-credit-card me-2"></i>
                      Tiến hành thanh toán
                    </button>

                    <button
                      className="btn btn-outline-danger w-100"
                      type="button"
                      onClick={clearCart}
                      disabled={cartItems.length === 0}
                    >
                      <i className="fas fa-trash me-2"></i>
                      Xóa toàn bộ giỏ hàng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CartPage;