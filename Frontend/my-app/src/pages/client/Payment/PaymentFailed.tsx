import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PaymentFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get("order_id");
    const status = params.get("status");
    const message = params.get("message");
    const responseCode = params.get("response_code");

    if (status === "failed") {
      toast.error("Thanh toán thất bại!");
      setIsLoading(false);

      // Redirect về trang đơn hàng sau 5 giây
      setTimeout(() => {
        navigate("/orders");
      }, 5000);
    } else {
      toast.error("Có lỗi xảy ra trong quá trình thanh toán");
      navigate("/orders");
    }
  }, [location, navigate]);

  const params = new URLSearchParams(location.search);
  const orderId = params.get("order_id");
  const message = params.get("message");
  const responseCode = params.get("response_code");

  if (isLoading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div className="text-center">
          <div className="spinner-border text-danger mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Đang xử lý...</h5>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="card shadow-lg border-0" style={{ maxWidth: "500px" }}>
        <div className="card-body text-center p-5">
          <div className="mb-4">
            <i
              className="fas fa-times-circle text-danger"
              style={{ fontSize: "4rem" }}
            ></i>
          </div>
          <h2 className="text-danger mb-3">Thanh toán thất bại!</h2>
          <p className="text-muted mb-4">
            Rất tiếc, thanh toán của bạn không thành công. Vui lòng thử lại hoặc
            chọn phương thức thanh toán khác.
          </p>

          <div className="bg-light p-4 rounded mb-4">
            <h6 className="fw-bold mb-3">Thông tin lỗi</h6>
            <div className="row text-start">
              {orderId && (
                <>
                  <div className="col-6">
                    <strong>Mã đơn hàng:</strong>
                  </div>
                  <div className="col-6">#{orderId}</div>
                </>
              )}

              {responseCode && (
                <>
                  <div className="col-6">
                    <strong>Mã lỗi:</strong>
                  </div>
                  <div className="col-6">{responseCode}</div>
                </>
              )}

              {message && (
                <>
                  <div className="col-6">
                    <strong>Thông báo:</strong>
                  </div>
                  <div className="col-6">{message}</div>
                </>
              )}
            </div>
          </div>

          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Đơn hàng của bạn vẫn được lưu. Bạn có thể thử thanh toán lại hoặc
            liên hệ hỗ trợ.
          </div>

          <div className="d-flex gap-2 justify-content-center">
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate("/orders")}
            >
              <i className="fas fa-list me-2"></i>
              Xem đơn hàng
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/cart")}
            >
              <i className="fas fa-shopping-cart me-2"></i>
              Về giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
