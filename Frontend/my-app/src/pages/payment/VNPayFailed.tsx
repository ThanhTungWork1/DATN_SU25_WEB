import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VNPayFailed: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const responseCode = params.get('vnp_ResponseCode') || params.get('response_code') || '';
  const orderId = params.get('vnp_TxnRef') || params.get('order_id') || '';
  const message = params.get('vnp_Message') || params.get('message') || 'Thanh toán thất bại hoặc bị hủy.';

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-danger text-white">
              <h4 className="mb-0">Thanh toán VNPay thất bại</h4>
            </div>
            <div className="card-body">
              <div className="alert alert-danger">
                <i className="fas fa-times-circle me-2"></i>
                {message}
              </div>
              <div className="mb-2"><strong>Mã phản hồi:</strong> {responseCode || 'N/A'}</div>
              <div className="mb-2"><strong>Mã đơn hàng:</strong> {orderId || 'N/A'}</div>

              <div className="d-flex gap-2 mt-4">
                <button className="btn btn-primary" onClick={() => navigate('/checkout')}>
                  Thử lại thanh toán
                </button>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/orders')}>
                  Đến danh sách đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VNPayFailed;
