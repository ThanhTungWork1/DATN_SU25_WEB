import { useForm } from "react-hook-form";
import useCart from "../../../hook/useCart";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeItem, clearCart } = useCart(token);

  const [selectedItems, setSelectedItems] = useState<{ [key: number]: boolean }>({});
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const { register, handleSubmit, setValue } = useForm();

  // Tự động chọn tất cả sản phẩm khi cartItems thay đổi
  useEffect(() => {
    const allSelected = cartItems.reduce((acc, item) => {
      acc[item.id] = true;
      return acc;
    }, {} as { [key: number]: boolean });
    setSelectedItems(allSelected);
    
    // Khởi tạo quantities từ cartItems
    const initialQuantities = cartItems.reduce((acc, item) => {
      acc[item.id] = item.quantity;
      return acc;
    }, {} as { [key: number]: number });
    setQuantities(initialQuantities);
  }, [cartItems]);

  const toggleSelectItem = (id: number) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onSubmit = () => {
    // Cập nhật số lượng từ state quantities
    Object.keys(quantities).forEach((idStr) => {
      const id = Number(idStr);
      const quantity = quantities[id];
      if (quantity > 0) updateQuantity(id, quantity);
    });
  };

  const selectedProducts = cartItems.filter((item) => selectedItems[item.id]).map(item => ({
    ...item,
    quantity: quantities[item.id] || item.quantity
  }));
  const shippingFee = 30000;
  const subtotalAmount = selectedProducts.reduce(
    (total, item) => total + (item.price * 1000) * item.quantity,
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
              onClick={() => window.location.href = '/products'}
            >
              <i className="fas fa-shopping-bag me-2"></i>
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
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
                      <div key={item.id} className={`p-4 ${index !== cartItems.length - 1 ? 'border-bottom' : ''}`}>
                        <div className="row align-items-center">
                          {/* Checkbox */}
                          <div className="col-auto">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`item-${item.id}`}
                                checked={selectedItems[item.id] || false}
                                onChange={() => toggleSelectItem(item.id)}
                                style={{ transform: 'scale(1.2)' }}
                              />
                            </div>
                          </div>
                          
                          {/* Hình ảnh sản phẩm */}
                          <div className="col-auto">
                            <div className="position-relative">
                              <img 
                                src={item.image || 'https://via.placeholder.com/100'} 
                                alt={item.name} 
                                className="rounded-3 shadow-sm"
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                              />
                            </div>
                          </div>
                          
                          {/* Thông tin sản phẩm */}
                          <div className="col">
                            <h6 className="fw-bold mb-2 text-dark">{item.name}</h6>
                            <div className="d-flex align-items-center mb-2">
                              <span className="badge bg-light text-dark me-2">
                                <i className="fas fa-palette me-1"></i>
                                {item.color || 'Mặc định'}
                              </span>
                              <span className="badge bg-light text-dark">
                                <i className="fas fa-expand-arrows-alt me-1"></i>
                                {item.size || 'M'}
                              </span>
                            </div>
                            <div className="fw-bold text-danger fs-5">
                              {(item.price * 1000).toLocaleString('vi-VN')} VND
                            </div>
                          </div>
                          
                          {/* Số lượng */}
                          <div className="col-auto">
                            <div className="d-flex align-items-center">
                              <label className="form-label me-2 mb-0 fw-semibold">Số lượng:</label>
                              <input
                                type="number"
                                min="1"
                                value={quantities[item.id] || item.quantity}
                                onChange={(e) => {
                                  const newQuantity = parseInt(e.target.value) || 1;
                                  setQuantities(prev => ({
                                    ...prev,
                                    [item.id]: newQuantity
                                  }));
                                }}
                                className="form-control text-center fw-bold"
                                style={{ width: '70px' }}
                              />
                            </div>
                          </div>
                          
                          {/* Nút xóa */}
                          <div className="col-auto">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeItem(item.id)}
                              title="Xóa sản phẩm"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="card-footer bg-white border-0 py-3">
                    <button type="submit" className="btn btn-outline-primary">
                      <i className="fas fa-sync-alt me-2"></i>
                      Cập nhật số lượng
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
