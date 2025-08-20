import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get("order_id");
    const amount = params.get("amount");
    const status = params.get("status");
    const transactionNo = params.get("transaction_no");
    const bankCode = params.get("bank_code");

    if (status === "success" && orderId) {
      toast.success("Thanh toán thành công!");
      setIsLoading(false);

      // Redirect về trang đơn hàng sau 3 giây
      setTimeout(() => {
        navigate("/orders");
      }, 10000);
    } else {
      toast.error("Có lỗi xảy ra trong quá trình thanh toán");
      navigate("/orders");
    }
  }, [location, navigate]);

  const params = new URLSearchParams(location.search);
  const orderId = params.get("order_id");
  const amount = params.get("amount");
  const transactionNo = params.get("transaction_no");
  const bankCode = params.get("bank_code");

  if (isLoading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div className="text-center">
          <div className="spinner-border text-success mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Đang xử lý thanh toán...</h5>
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
              className="fas fa-check-circle text-success"
              style={{ fontSize: "4rem" }}
            ></i>
          </div>
          <h2 className="text-success mb-3">Thanh toán thành công!</h2>
          <p className="text-muted mb-4">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xử lý thành công.
          </p>

          <div className="bg-light p-4 rounded mb-4">
            <h6 className="fw-bold mb-3">Thông tin thanh toán</h6>
            <div className="row text-start">
              <div className="col-6">
                <strong>Mã đơn hàng:</strong>
              </div>
              <div className="col-6">#{orderId}</div>

              <div className="col-6">
                <strong>Số tiền:</strong>
              </div>
              <div className="col-6">
                {amount
                  ? Number(amount).toLocaleString("vi-VN") + " VND"
                  : "N/A"}
              </div>

              {transactionNo && (
                <>
                  <div className="col-6">
                    <strong>Mã giao dịch:</strong>
                  </div>
                  <div className="col-6">{transactionNo}</div>
                </>
              )}

              {bankCode && (
                <>
                  <div className="col-6">
                    <strong>Ngân hàng:</strong>
                  </div>
                  <div className="col-6">{bankCode}</div>
                </>
              )}
            </div>
          </div>

          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            Bạn sẽ được chuyển hướng về trang đơn hàng trong vài giây.
          </div>

          <button
            className="btn btn-primary"
            onClick={() => navigate("/orders")}
          >
            <i className="fas fa-list me-2"></i>
            Xem đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
