import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const orderId = params.get("order_id");
  const amount = params.get("amount");
  const transactionNo = params.get("transaction_no");
  const bankCode = params.get("bank_code");

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h2 className="text-success fw-bold">
          <i className="fas fa-check-circle me-2" /> Thanh toán thành công
        </h2>
        <p className="text-muted">Cảm ơn bạn đã mua hàng!</p>
      </div>

      <div className="card shadow-sm mx-auto" style={{ maxWidth: 640 }}>
        <div className="card-body">
          <h5 className="fw-bold mb-3">Thông tin thanh toán</h5>
          <ul className="list-unstyled mb-4">
            <li>
              <span className="text-muted">Mã đơn hàng:</span>
              <span className="ms-2 fw-semibold">{orderId || "N/A"}</span>
            </li>
            <li>
              <span className="text-muted">Số tiền:</span>
              <span className="ms-2 fw-semibold">{amount ? Number(amount).toLocaleString("vi-VN") + " VND" : "N/A"}</span>
            </li>
            <li>
              <span className="text-muted">Mã giao dịch VNPay:</span>
              <span className="ms-2 fw-semibold">{transactionNo || "N/A"}</span>
            </li>
            <li>
              <span className="text-muted">Ngân hàng:</span>
              <span className="ms-2 fw-semibold">{bankCode || "N/A"}</span>
            </li>
          </ul>

          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={() => navigate("/orders")}>Xem đơn hàng</button>
            <button className="btn btn-outline-secondary" onClick={() => navigate("/")}>Tiếp tục mua sắm</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
