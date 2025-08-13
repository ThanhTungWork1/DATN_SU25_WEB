import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VNPaySuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean | null>(null);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const responseCode = params.get('vnp_ResponseCode') || '';
  const orderId = params.get('vnp_TxnRef') || '';
  const amount = params.get('vnp_Amount') || params.get('amount');
  const transactionNo = params.get('vnp_TransactionNo') || params.get('transaction_no') || '';
  const bankCode = params.get('vnp_BankCode') || params.get('bank_code') || '';
  const status = params.get('status') || '';

  const token = localStorage.getItem('user_token') || '';

  useEffect(() => {
    // Optional: verify status with backend
    const verify = async () => {
      if (!transactionNo) return;
      try {
        setChecking(true);
        const res = await axios.post(
          '/api/payments/vnpay/check-status',
          { transaction_no: String(transactionNo) },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data: any = res.data;
        setStatusMsg(data?.message || 'Đã xác minh trạng thái thanh toán.');
        if (data?.success === true || data?.status === 'success' || data?.payment_status === 'completed') {
          setVerifiedSuccess(true);
        } else if (data?.success === false) {
          setVerifiedSuccess(false);
        }
      } catch (e: any) {
        setStatusMsg(e?.response?.data?.error || e?.response?.data?.message || 'Không thể xác minh trạng thái.');
        setVerifiedSuccess(false);
      } finally {
        setChecking(false);
      }
    };

    // Verify if VNPay indicated success or backend returned success
    if (responseCode === '00' || status === 'success') {
      verify();
    }
  }, [transactionNo, responseCode, status, token]);

  const goToOrders = () => navigate('/orders');

  const success = responseCode === '00' || status === 'success' || verifiedSuccess === true;

  // Amount rendering: if original VNPay param exists, divide by 100; otherwise assume backend value is in VND already
  const showAmount = (() => {
    if (params.get('vnp_Amount')) {
      return amount ? Number(amount) / 100 : undefined;
    }
    return amount ? Number(amount) : undefined;
  })();

  // Auto redirect to OrderSuccess when success detected
  useEffect(() => {
    if (!success) return;
    // prepare minimal order data for OrderSuccess page
    const orderIdForState = orderId || params.get('order_id') || '';
    const stateData = {
      orderId: orderIdForState,
      paymentMethod: 'VNPay',
      paymentStatus: 'completed',
      finalOrderAmount: showAmount || 0,
      createdAt: new Date().toISOString(),
    } as any;

    // Delay slightly to allow any UI notice/verification
    const t = setTimeout(() => {
      // Truyền thêm transaction_no, bank_code và status qua query để OrderSuccess có thể gọi check-status bằng transaction_no
      const qs = new URLSearchParams();
      if (orderIdForState) qs.set('order_id', String(orderIdForState));
      if (transactionNo) qs.set('vnp_TransactionNo', String(transactionNo));
      if (bankCode) qs.set('vnp_BankCode', String(bankCode));
      qs.set('status', 'success');
      navigate(`/order-success?${qs.toString()}`, { state: stateData });
    }, 500);

    return () => clearTimeout(t);
    // we intentionally exclude navigate from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, showAmount, orderId, location.search]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className={`card border-0 shadow-sm ${success ? 'border-success' : 'border-danger'}`}>
            <div className={`card-header text-white ${success ? 'bg-success' : 'bg-danger'}`}>
              <h4 className="mb-0">
                {success ? 'Thanh toán VNPay thành công' : 'Thanh toán VNPay thất bại'}
              </h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Mã phản hồi:</strong> {responseCode || (success ? '00' : 'N/A')}
              </div>
              <div className="mb-3">
                <strong>Mã đơn hàng:</strong> {orderId || params.get('order_id') || 'N/A'}
              </div>
              <div className="mb-3">
                <strong>Số tiền:</strong> {showAmount !== undefined ? showAmount : 'N/A'} VND
              </div>
              <div className="mb-3">
                <strong>Mã giao dịch:</strong> {transactionNo || 'N/A'}
              </div>
              <div className="mb-3">
                <strong>Ngân hàng:</strong> {bankCode || 'N/A'}
              </div>

              {checking ? (
                <div className="alert alert-info">
                  <i className="fas fa-spinner fa-spin me-2"></i>Đang xác minh trạng thái thanh toán...
                </div>
              ) : statusMsg ? (
                <div className="alert alert-secondary">{statusMsg}</div>
              ) : null}

              <div className="d-flex gap-2 mt-4">
                <button className="btn btn-primary" onClick={goToOrders}>
                  <i className="fas fa-list me-2"></i>Đến danh sách đơn hàng
                </button>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>Về trang chủ</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VNPaySuccess;
