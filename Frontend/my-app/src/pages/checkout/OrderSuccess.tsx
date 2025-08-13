import { useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

const OrderSuccess = () => {
  const location = useLocation();
  const orderData = location.state as any;

  // Read order_id from query (VNPay redirect attaches it) or from location.state
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const orderIdFromQuery = queryParams.get('order_id');
  const orderId: number | undefined = useMemo(() => {
    const id = orderIdFromQuery ?? orderData?.orderId ?? orderData?.order_id;
    return id ? Number(id) : undefined;
  }, [orderIdFromQuery, orderData]);

  // Optional info from VNPay redirect
  const vnpStatus = queryParams.get('status');
  // VNPay có thể trả về nhiều key khác nhau cho mã giao dịch
  const vnpTransactionNo =
    queryParams.get('vnp_TransactionNo') ||
    queryParams.get('transaction_no') ||
    queryParams.get('vnp_transaction_no') ||
    undefined as string | undefined;
  const vnpBankCode = queryParams.get('bank_code') || queryParams.get('vnp_BankCode') || undefined as string | undefined;

  // Local states for fetching real status from backend
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<{
    order_id: number;
    is_paid: boolean;
    order_status: string;
    payment_status: string;
    payment_method?: string | null;
    paid_at?: string | null;
  } | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  // Decide effective payment method label
  const paymentMethodLabel: string | undefined = statusData?.payment_method || orderData?.paymentMethod;
  const isCOD = (paymentMethodLabel || '').toLowerCase().includes('cod');

  // Effective payment status preference: DB -> location.state -> VNPay query hint
  const paymentStatus: string | undefined = useMemo(() => {
    if (statusData?.payment_status) return statusData.payment_status;
    if (orderData?.paymentStatus) return orderData.paymentStatus;
    if (vnpStatus === 'success') return 'completed';
    return undefined;
  }, [statusData, orderData, vnpStatus]);

  useEffect(() => {
  const fetchStatus = async () => {
    // BE yêu cầu transaction_no. Nếu không có thì không gọi để tránh 422
    if (!vnpTransactionNo) {
      setError('Không tìm thấy mã giao dịch VNPay (transaction_no). Bỏ qua kiểm tra trạng thái.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('user_token');
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
      const url = `${API_BASE}/api/payments/vnpay/check-status`;
      const payload = { transaction_no: String(vnpTransactionNo) } as const;

      const res = await fetch(url, {
        method: 'POST', // BE yêu cầu POST
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        if (res.status === 401) {
          throw new Error('401 Unauthorized - Vui lòng đăng nhập lại.');
        }
        if (res.status === 404) {
          throw new Error('404 Not Found - Không tìm thấy trạng thái thanh toán.');
        }
        throw new Error(text || `Request failed with ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      // Chuẩn hóa dữ liệu trả về: BE có thể trả dạng { success, data: {...} } hoặc trả thẳng {...}
      const raw = (data && typeof data === 'object' && 'data' in data) ? (data as any).data : data;

      const toUnifiedStatus = (val: any): 'completed' | 'pending' | 'failed' => {
        const s = String(val || '').toLowerCase();
        if (['completed', 'paid', 'success', 'succeeded'].includes(s)) return 'completed';
        if (['failed', 'failure', 'canceled', 'cancelled', 'error'].includes(s)) return 'failed';
        return 'pending';
      };

      const derived = raw?.payment_status ?? raw?.status ?? (((data as any)?.success === true) ? 'completed' : undefined);
      const unified = toUnifiedStatus(derived);

      const normalized = {
        order_id: Number(raw?.order_id ?? orderId),
        is_paid: unified === 'completed' || Boolean(raw?.is_paid),
        order_status: String(raw?.order_status ?? raw?.status ?? unified),
        payment_status: unified,
        payment_method: raw?.payment_method ?? orderData?.paymentMethod ?? null,
        paid_at: raw?.paid_at ?? null,
      } as {
        order_id: number;
        is_paid: boolean;
        order_status: string;
        payment_status: string;
        payment_method?: string | null;
        paid_at?: string | null;
      };
      setStatusData(normalized);
    } catch (err: any) {
      console.error('Failed to fetch payment status:', err);
      setError(err?.message || 'Không thể lấy trạng thái thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  fetchStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [orderId, vnpTransactionNo, refreshTick]);
  
  console.log('Order Success - Received data:', orderData, { orderId, vnpStatus, vnpTransactionNo, vnpBankCode, statusData });
  
  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Success Header */}
            <div className="text-center mb-5">
              <div className="mb-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success" 
                     style={{ width: '120px', height: '120px' }}>
                  <i className="fas fa-check text-white" style={{ fontSize: '3rem' }}></i>
                </div>
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
                    Chi tiết đơn hàng #{orderId || orderData.orderId || 'N/A'}
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
                        <strong>Phương thức thanh toán:</strong> {paymentMethodLabel || 'N/A'}
                      </div>
                      <div className="mb-2">
                        <strong>Trạng thái thanh toán:</strong>
                        <span className={`badge ms-2 ${
                          paymentStatus === 'completed' ? 'bg-success' : 
                          paymentStatus === 'pending' ? 'bg-warning' : 'bg-secondary'
                          }`}>
                          {paymentStatus === 'completed' ? 'Đã thanh toán' : 
                           paymentStatus === 'pending' ? 'Chờ thanh toán' : 'Chưa xác định'}
                        </span>
                        {loading && (
                          <span className="ms-2 text-muted small">Đang kiểm tra trạng thái...</span>
                        )}
                        {error && (
                          <div className="text-danger small mt-2">{error}</div>
                        )}
                        <div className="mt-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            disabled={loading}
                            onClick={() => setRefreshTick(t => t + 1)}
                          >
                            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-rotate' } me-2`}></i>
                            Kiểm tra lại trạng thái
                          </button>
                        </div>
                        {/* Helper text by status */}
                        {paymentStatus === 'pending' && (
                          <div className="text-muted small mt-2">
                            {isCOD ? (
                              <>
                                Bạn đã chọn thanh toán khi nhận hàng (COD). Vui lòng chuẩn bị tiền mặt khi nhận hàng.
                              </>
                            ) : (
                              <>
                                Thanh toán của bạn đang chờ xác nhận. Nếu bạn chọn chuyển khoản, vui lòng thực hiện theo hướng dẫn và chờ hệ thống cập nhật.
                              </>
                            )}
                          </div>
                        )}
                        {paymentStatus === 'completed' && (
                          <div className="text-success small mt-2">
                            Thanh toán đã được xác nhận. Cảm ơn bạn!
                          </div>
                        )}
                        {/* Show VNPay transaction info if available */}
                        {(vnpTransactionNo || vnpBankCode) && (
                          <div className="text-muted small mt-2">
                            {vnpTransactionNo && (
                              <div><strong>Mã giao dịch:</strong> {vnpTransactionNo}</div>
                            )}
                            {vnpBankCode && (
                              <div><strong>Ngân hàng:</strong> {vnpBankCode}</div>
                            )}
                          </div>
                        )}
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
                            {(item.price * item.quantity).toLocaleString('vi-VN')} VND
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
                        <span className="fw-semibold">{(orderData.totalAmount - (orderData.shippingFee || 30000) + (orderData.discountAmount || 0)).toLocaleString('vi-VN')} VND</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Phí vận chuyển:</span>
                        <span className="fw-semibold">{(orderData.shippingFee || 30000).toLocaleString('vi-VN')} VND</span>
                      </div>
                      {orderData.discountAmount > 0 && (
                        <div className="d-flex justify-content-between mb-2">
                          <span>Giảm giá:</span>
                          <span className="fw-semibold text-success">-{orderData.discountAmount.toLocaleString('vi-VN')} VND</span>
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
