import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OrderSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    orderId,
    orderData,
    address,
    totalAmount,
    paymentMethod,
    createdAt,
    items,
    customerName,
    customerPhone,
    voucherCode,
    discountAmount,
    shippingFee,
    finalOrderAmount
  } = state || {};
  
  console.log('Order Success Data:', { orderId, orderData, totalAmount, finalOrderAmount });

  if (!orderId) {
    return (
      <div className="text-center mt-5">
        <h2>Không có thông tin đơn hàng.</h2>
        <button onClick={() => navigate("/")} className="btn btn-primary mt-3">
          Quay về Trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="container my-5 text-center">
      <h2 className="text-success fw-bold">🎉 Đơn hàng của bạn đã được đặt thành công!</h2>
      <p className="mt-4">Cảm ơn bạn đã mua hàng tại <b>StrideX</b>.</p>
      
      <div className="alert alert-info mx-auto" style={{ maxWidth: 600 }}>
        <i className="fas fa-info-circle me-2"></i>
        Sản phẩm đã được xóa khỏi giỏ hàng của bạn
      </div>

      <div className="border p-4 mt-4 text-start mx-auto" style={{ maxWidth: 600 }}>
        <h4 className="fw-bold">Thông tin đơn hàng</h4>
        <p><b>Mã đơn hàng:</b> #{orderId}</p>
              </div>
              <h1 className="display-5 fw-bold text-success mb-3">Đặt hàng thành công!</h1>
              <p className="fs-5 text-muted mb-4">
                Cảm ơn bạn đã tin tưởng và đặt hàng tại cửa hàng của chúng tôi.
                <br />Đơn hàng của bạn đang được xử lý và sẽ được giao trong thời gian sớm nhất.
              </p>
            </div>

            {/* Order Details Card */}
            {orderData && (
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-primary text-white py-3">
                  <h5 className="mb-0 fw-bold">
                    <i className="fas fa-receipt me-2"></i>
                    Chi tiết đơn hàng #{orderData.orderId || 'N/A'}
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-4">
                    {/* Customer Info */}
                    <div className="col-md-6">
                      <h6 className="fw-bold text-primary mb-3">
                        <i className="fas fa-user me-2"></i>
                        Thông tin khách hàng
                      </h6>
                      <div className="mb-2">
                        <strong>Họ tên:</strong> {orderData.customerName || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <strong>Số điện thoại:</strong> {orderData.customerPhone || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <strong>Địa chỉ giao hàng:</strong>
                        <div className="text-muted">
                          {orderData.address ? 
                            `${orderData.address.street}, ${orderData.address.ward}, ${orderData.address.district}, ${orderData.address.province}` 
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="col-md-6">
                      <h6 className="fw-bold text-primary mb-3">
                        <i className="fas fa-info-circle me-2"></i>
                        Thông tin đơn hàng
                      </h6>
                      <div className="mb-2">
                        <strong>Ngày đặt:</strong> {orderData.createdAt ? new Date(orderData.createdAt).toLocaleString('vi-VN') : 'N/A'}
                      </div>
                      <div className="mb-2">
                        <strong>Phương thức thanh toán:</strong> {orderData.paymentMethod || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <strong>Trạng thái thanh toán:</strong>
                        <span className={`badge ms-2 ${
                          orderData.paymentStatus === 'completed' ? 'bg-success' : 
                          orderData.paymentStatus === 'pending' ? 'bg-warning' : 'bg-secondary'
                        }`}>
                          {orderData.paymentStatus === 'completed' ? 'Đã thanh toán' : 
                           orderData.paymentStatus === 'pending' ? 'Chờ thanh toán' : 'Chưa xác định'}
                        </span>
                      </div>
                      {orderData.voucherCode && (
                        <div className="mb-2">
                          <strong>Mã giảm giá:</strong> 
                          <span className="badge bg-success ms-2">{orderData.voucherCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            {orderData?.items && orderData.items.length > 0 && (
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white border-0 py-3">
                  <h6 className="mb-0 fw-bold">
                    <i className="fas fa-box text-primary me-2"></i>
                    Sản phẩm đã đặt ({orderData.items.length})
                  </h6>
                </div>
                <div className="card-body p-0">
                  {orderData.items.map((item: any, index: number) => (
                    <div key={index} className={`p-4 ${index !== orderData.items.length - 1 ? 'border-bottom' : ''}`}>
                      <div className="row align-items-center">
                        <div className="col-auto">
                          <img 
                            src={item.image || 'https://via.placeholder.com/60'} 
                            alt={item.name} 
                            className="rounded-3"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          />
                        </div>
                        <div className="col">
                          <h6 className="fw-bold mb-1">{item.name}</h6>
                          <div className="text-muted small">Số lượng: {item.quantity}</div>
                        </div>
                        <div className="col-auto">
                          <div className="fw-bold text-danger">
                            {((item.price * 1000) * item.quantity).toLocaleString('vi-VN')} VND
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Summary */}
            {orderData && (
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-light border-0 py-3">
                  <h6 className="mb-0 fw-bold">
                    <i className="fas fa-calculator text-success me-2"></i>
                    Tổng kết đơn hàng
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Tạm tính:</span>
                        <span className="fw-semibold">{Math.round(orderData.totalAmount - (orderData.shippingFee || 30000) + (orderData.discountAmount || 0)).toLocaleString('vi-VN')} VND</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Phí vận chuyển:</span>
                        <span className="fw-semibold">{(orderData.shippingFee || 30000).toLocaleString('vi-VN')} VND</span>
                      </div>
                      {orderData.discountAmount > 0 && (
                        <div className="d-flex justify-content-between mb-2">
                          <span>Giảm giá:</span>
                          <span className="fw-semibold text-success">-{Math.round(orderData.discountAmount).toLocaleString('vi-VN')} VND</span>
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <div className="text-end">
                        <div className="fs-4 fw-bold text-danger">
                          Tổng cộng: {(orderData.finalOrderAmount || orderData.totalAmount || 0).toLocaleString('vi-VN')} VND
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="text-center">
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <button 
                  className="btn btn-primary btn-lg px-4 py-2"
                  onClick={() => window.location.href = '/orders'}
                >
                  <i className="fas fa-list me-2"></i>
                  Xem đơn hàng của tôi
                </button>
                <button 
                  className="btn btn-outline-primary btn-lg px-4 py-2"
                  onClick={() => window.location.href = '/products'}
                >
                  <i className="fas fa-shopping-bag me-2"></i>
                  Tiếp tục mua sắm
                </button>
                <button 
                  className="btn btn-outline-secondary btn-lg px-4 py-2"
                  onClick={() => window.location.href = '/'}
                >
                  <i className="fas fa-home me-2"></i>
                  Về trang chủ
                </button>
              </div>
            </div>

            {/* Support Info */}
            <div className="text-center mt-5">
              <div className="card border-0 bg-light">
                <div className="card-body py-4">
                  <h6 className="fw-bold mb-3">
                    <i className="fas fa-headset text-primary me-2"></i>
                    Cần hỗ trợ?
                  </h6>
                  <p className="text-muted mb-3">
                    Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi:
                  </p>
                  <div className="d-flex justify-content-center gap-4">
                    <div>
                      <i className="fas fa-phone text-success me-2"></i>
                      <strong>Hotline:</strong> 1900-1234
                    </div>
                    <div>
                      <i className="fas fa-envelope text-primary me-2"></i>
                      <strong>Email:</strong> support@shop.com
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
