import { useLocation } from "react-router-dom";

interface OrderState {
  id: number; // Changed from orderId
  customer_name: string; // Changed from customerName
  customer_phone: string; // Changed from customerPhone
  shipping_address: string; // Changed from address
  created_at: string;
  payment_method: string; // Changed from paymentMethod
  status: string;
  is_paid: boolean;
  items: any[];
  total_amount: number; // Changed from totalAmount
  shipping_fee: number; // Changed from shippingFee
  discount_amount: number; // Changed from discountAmount
  final_amount: number; // Changed from finalOrderAmount
  voucher_code?: string; // Changed from voucherCode
  // Keep frontend-specific fields if needed, but align with backend first
  address?: any; // For compatibility if still used
}

const OrderSuccess = () => {
  const location = useLocation();
  const orderData = location.state?.orderData as OrderState;

  // Helper to parse status like '0 pending' -> 'pending'
  const getStatusKey = (status: string) => {
    if (!status) return "";
    const parts = status.split(' ');
    return parts[parts.length - 1];
  };

  const statusKey = getStatusKey(orderData?.status);

  console.log("Order Success - Received data:", orderData);

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Success Header */}
            <div className="text-center mb-5">
              <div className="mb-4">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success"
                  style={{ width: "120px", height: "120px" }}
                >
                  <i
                    className="fas fa-check text-white"
                    style={{ fontSize: "3rem" }}
                  ></i>
                </div>
              </div>
              <h1 className="display-5 fw-bold text-success mb-3">
                Đặt hàng thành công!
              </h1>
              <p className="fs-5 text-muted mb-4">
                Cảm ơn bạn đã tin tưởng và đặt hàng tại cửa hàng của chúng tôi.
                <br />
                Đơn hàng của bạn đang được xử lý và sẽ được giao trong thời gian
                sớm nhất.
              </p>
            </div>

            {/* Order Details Card */}
            {orderData && (
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-primary text-white py-3">
                  <h5 className="mb-0 fw-bold">
                    <i className="fas fa-receipt me-2"></i>
                    Chi tiết đơn hàng #{orderData.id || "N/A"}
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
                        <strong>Họ tên:</strong>{" "}
                        {orderData.customer_name || "N/A"}
                      </div>
                      <div className="mb-2">
                        <strong>Số điện thoại:</strong>{" "}
                        {orderData.customer_phone || "N/A"}
                      </div>
                      <div className="mb-2">
                        <strong>Địa chỉ giao hàng:</strong>
                        <div className="text-muted">
                          {orderData.shipping_address || "N/A"}
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
                        <strong>Ngày đặt:</strong>{" "}
                        {orderData.created_at
                          ? new Date(orderData.created_at).toLocaleString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </div>
                      <div className="mb-2">
                        <strong>Phương thức thanh toán:</strong>{" "}
                        {orderData.payment_method || "N/A"}
                      </div>
                      <div className="mb-2">
                        <strong>Trạng thái đơn hàng:</strong>
                        <span
                          className={`badge ms-2 ${
                            ({
                              pending: "bg-warning text-dark",
                              confirmed: "bg-primary",
                              processing: "bg-info text-dark",
                              shipping: "bg-info",
                              delivered: "bg-success",
                              completed: "bg-success",
                              cancelled: "bg-danger",
                            }[statusKey] || "bg-secondary")
                          }`}
                        >
                          {{
                              pending: "Chờ xác nhận",
                              confirmed: "Đã xác nhận",
                              processing: "Đang xử lý",
                              shipping: "Đang giao hàng",
                              delivered: "Đã giao hàng",
                              completed: "Đã hoàn thành",
                              cancelled: "Đã huỷ",
                            }[statusKey] || "Không xác định"}
                        </span>
                      </div>
                      {orderData.voucher_code && (
                        <div className="mb-2">
                          <strong>Mã giảm giá:</strong>
                          <span className="badge bg-success ms-2">
                            {orderData.voucher_code}
                          </span>
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
                    <div
                      key={index}
                      className={`p-4 ${index !== orderData.items.length - 1 ? "border-bottom" : ""}`}
                    >
                      <div className="row align-items-center">
                        <div className="col-auto">
                          <img
                            src={item.image || "https://via.placeholder.com/60"}
                            alt={item.name}
                            className="rounded-3"
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <div className="col">
                          <h6 className="fw-bold mb-1">{item.name}</h6>
                          <div className="text-muted small">
                            Số lượng: {item.quantity}
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="fw-bold text-danger">
                            {(item.price * 1000 * item.quantity).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            VND
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
                        <span>Tổng tiền sản phẩm:</span>
                        <span className="fw-semibold">
                          {orderData.total_amount.toLocaleString("vi-VN")}{" "}
                          VND
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Phí vận chuyển:</span>
                        <span className="fw-semibold">
                          {orderData.shipping_fee.toLocaleString("vi-VN")}{" "}
                          VND
                        </span>
                      </div>
                      {orderData.discount_amount > 0 && (
                        <div className="d-flex justify-content-between mb-2">
                          <span>Giảm giá:</span>
                          <span className="fw-semibold text-success">
                            -{orderData.discount_amount.toLocaleString("vi-VN")}{" "}
                            VND
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <div className="text-end">
                        <div className="fs-4 fw-bold text-danger">
                          Tổng cộng:{" "}
                          {orderData.final_amount.toLocaleString("vi-VN")}{" "}
                          VND
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
                  onClick={() => (window.location.href = "/orders")}
                >
                  <i className="fas fa-list me-2"></i>
                  Xem đơn hàng của tôi
                </button>
                <button
                  className="btn btn-outline-primary btn-lg px-4 py-2"
                  onClick={() => (window.location.href = "/products")}
                >
                  <i className="fas fa-shopping-bag me-2"></i>
                  Tiếp tục mua sắm
                </button>
                <button
                  className="btn btn-outline-secondary btn-lg px-4 py-2"
                  onClick={() => (window.location.href = "/")}
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
                    Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ
                    với chúng tôi:
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
