import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentFailed: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const orderId = params.get("order_id");
  const message = params.get("message") || "Thanh toán thất bại. Vui lòng thử lại.";
  const responseCode = params.get("response_code");

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h2 className="text-danger fw-bold">
          <i className="fas fa-times-circle me-2" /> Thanh toán thất bại
        </h2>
        <p className="text-muted">{message}</p>
      </div>

      <div className="card shadow-sm mx-auto" style={{ maxWidth: 640 }}>
        <div className="card-body">
          <h5 className="fw-bold mb-3">Thông tin</h5>
          <ul className="list-unstyled mb-4">
            <li>
              <span className="text-muted">Mã đơn hàng:</span>
              <span className="ms-2 fw-semibold">{orderId || "N/A"}</span>
            </li>
            <li>
              <span className="text-muted">Mã phản hồi:</span>
              <span className="ms-2 fw-semibold">{responseCode || "N/A"}</span>
            </li>
          </ul>

          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={() => navigate("/checkout")}>Thử lại</button>
            <button className="btn btn-outline-secondary" onClick={() => navigate("/")}>Về trang chủ</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
