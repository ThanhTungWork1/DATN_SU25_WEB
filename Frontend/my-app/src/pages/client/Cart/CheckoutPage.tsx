import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClientOrder } from "../../../api/order";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant_id: number;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [shippingInfo, setShippingInfo] = useState({
    shipping_name: "",
    shipping_phone: "",
    shipping_address: "",
    note: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const shippingFee = 30000;
  const totalAmount = calculateTotal();
  const finalTotal = totalAmount + shippingFee;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!shippingInfo.shipping_name.trim()) {
      newErrors.shipping_name = "Vui lòng nhập họ tên người nhận";
    }
    if (!shippingInfo.shipping_phone.trim()) {
      newErrors.shipping_phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10,11}$/.test(shippingInfo.shipping_phone)) {
      newErrors.shipping_phone = "Số điện thoại không hợp lệ";
    }
    if (!shippingInfo.shipping_address.trim()) {
      newErrors.shipping_address = "Vui lòng nhập địa chỉ giao hàng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        shipping_address: shippingInfo.shipping_address,
        shipping_phone: shippingInfo.shipping_phone,
        shipping_name: shippingInfo.shipping_name,
        note: shippingInfo.note || undefined,
        items: cartItems.map(item => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const response = await createClientOrder(orderData);
      
      if (response.data.status === 'success') {
        // Clear cart after successful order
        localStorage.removeItem("cart");
        alert("Đặt hàng thành công!");
        navigate("/orders");
      } else {
        throw new Error(response.data.message || "Đặt hàng thất bại");
      }
    } catch (error: any) {
      console.error("Order failed:", error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        const message = error.response?.data?.message || error.message || "Có lỗi xảy ra khi đặt hàng";
        alert(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4">Thanh toán đơn hàng</h2>
      
      <div className="row">
        {/* Order Items */}
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5>Sản phẩm đặt mua</h5>
            </div>
            <div className="card-body">
              {cartItems.length === 0 ? (
                <p>Giỏ hàng trống</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="border-bottom py-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex">
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: "60px", height: "60px", objectFit: "cover" }}
                          className="me-3"
                        />
                        <div>
                          <h6 className="mb-1">{item.name}</h6>
                          <small className="text-muted">
                            Số lượng: {item.quantity}
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">
                          {(item.price * item.quantity).toLocaleString()}₫
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="card">
            <div className="card-header">
              <h5>Thông tin giao hàng</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Họ tên người nhận *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.shipping_name ? 'is-invalid' : ''}`}
                    name="shipping_name"
                    value={shippingInfo.shipping_name}
                    onChange={handleInputChange}
                    placeholder="Nhập họ tên"
                  />
                  {errors.shipping_name && (
                    <div className="invalid-feedback">{errors.shipping_name}</div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Số điện thoại *</label>
                  <input
                    type="tel"
                    className={`form-control ${errors.shipping_phone ? 'is-invalid' : ''}`}
                    name="shipping_phone"
                    value={shippingInfo.shipping_phone}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.shipping_phone && (
                    <div className="invalid-feedback">{errors.shipping_phone}</div>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Địa chỉ giao hàng *</label>
                <input
                  type="text"
                  className={`form-control ${errors.shipping_address ? 'is-invalid' : ''}`}
                  name="shipping_address"
                  value={shippingInfo.shipping_address}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ chi tiết"
                />
                {errors.shipping_address && (
                  <div className="invalid-feedback">{errors.shipping_address}</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Ghi chú (tùy chọn)</label>
                <textarea
                  className="form-control"
                  name="note"
                  value={shippingInfo.note}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Ghi chú về đơn hàng (nếu có)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>Tóm tắt đơn hàng</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Tạm tính:</span>
                <span>{totalAmount.toLocaleString()}₫</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Phí vận chuyển:</span>
                <span>{shippingFee.toLocaleString()}₫</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Tổng cộng:</strong>
                <strong className="text-danger">{finalTotal.toLocaleString()}₫</strong>
              </div>
              
              <button 
                className="btn btn-success w-100 mt-3" 
                onClick={handleOrder}
                disabled={isLoading || cartItems.length === 0}
              >
                {isLoading ? "Đang xử lý..." : "Đặt hàng"}
              </button>
              
              <button 
                className="btn btn-outline-secondary w-100 mt-2"
                onClick={() => navigate("/cart")}
                disabled={isLoading}
              >
                Quay lại giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
