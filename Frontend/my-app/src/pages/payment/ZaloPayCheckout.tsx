import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface OrderData {
  id: number;
  order_code: string;
  total_amount: number;
  shipping_fee: number;
  final_amount: number;
  created_at: string;
}

interface LocationState {
  orderId: number;
  amount: number;
  orderData: OrderData;
}

interface PaymentData {
  success: boolean;
  pay_url: string;
  payment_id: number;
  amount: number;
  app_trans_id?: string;
}

const ZaloPayCheckout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [countdown, setCountdown] = useState(600); // 10 phút
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string>('');

  const state = location.state as LocationState;

  useEffect(() => {
    if (!state?.orderId) {
      navigate('/cart');
      return;
    }

    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [state, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0 || paymentStatus === 'completed') return;

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, paymentStatus]);

  // Hết thời gian thanh toán
  useEffect(() => {
    if (countdown <= 0 && paymentStatus !== 'completed') {
      setPaymentStatus('failed');
      setError('Phiên thanh toán đã hết hạn');
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    }
  }, [countdown, paymentStatus]);

  const createZaloPayOrder = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('user_token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để thanh toán');
      }

      const response = await axios.post(
        `http://localhost:8000/api/payments/zalopay/create`,
        { order_id: state.orderId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setPaymentData(response.data);
        setPaymentStatus('processing');
        startStatusChecking();
      } else {
        throw new Error(response.data.error || 'Không thể tạo đơn thanh toán');
      }
    } catch (error: any) {
      console.error('Error creating ZaloPay order:', error);
      setError(error.response?.data?.error || error.message || 'Lỗi tạo đơn thanh toán');
      setPaymentStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const startStatusChecking = () => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('user_token');
        const response = await axios.get(
          `http://localhost:8000/api/payments/zalopay/status/${state.orderId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        console.log('Payment status check:', response.data);

        if (response.data.payment_status === 'completed') {
          setPaymentStatus('completed');
          clearInterval(interval);
          
          // Chuyển hướng đến trang thành công sau 2 giây
          setTimeout(() => {
            navigate('/order-success', {
              state: {
                orderId: state.orderId,
                orderData: state.orderData,
                paymentData: response.data,
                message: 'Thanh toán ZaloPay thành công!'
              }
            });
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 3000); // Kiểm tra mỗi 3 giây

    setStatusCheckInterval(interval);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOpenZaloPay = () => {
    if (paymentData?.pay_url) {
      // Mở trong tab mới
      window.open(paymentData.pay_url, '_blank', 'width=800,height=600');
    }
  };

  const handleRetry = () => {
    setPaymentStatus('pending');
    setError('');
    setCountdown(600);
    createZaloPayOrder();
  };

  const handleCancel = () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }
    navigate('/cart');
  };

  if (!state?.orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Không tìm thấy thông tin đơn hàng
          </h2>
          <button
            onClick={() => navigate('/cart')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Về giỏ hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Thanh toán ZaloPay</h1>
                <p className="text-blue-100 mt-1">
                  Đơn hàng #{state.orderData?.order_code || state.orderId}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Thời gian còn lại</div>
                <div className="text-2xl font-bold text-yellow-300">
                  {formatTime(countdown)}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-6 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin đơn hàng
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium">#{state.orderData?.order_code || state.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền hàng:</span>
                <span className="font-medium">
                  {state.orderData?.total_amount?.toLocaleString('vi-VN') || '0'} VND
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium">
                  {state.orderData?.shipping_fee?.toLocaleString('vi-VN') || '0'} VND
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold text-blue-600 pt-3 border-t">
                <span>Tổng thanh toán:</span>
                <span>{state.amount?.toLocaleString('vi-VN')} VND</span>
              </div>
            </div>
          </div>

          {/* Payment Content */}
          <div className="p-6">
            {paymentStatus === 'pending' && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                    <i className="fas fa-mobile-alt text-3xl text-blue-600"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Sẵn sàng thanh toán
                  </h3>
                  <p className="text-gray-600">
                    Nhấn nút bên dưới để bắt đầu thanh toán qua ZaloPay
                  </p>
                </div>
                
                <button
                  onClick={createZaloPayOrder}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang tạo đơn thanh toán...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <i className="fab fa-paypal text-xl"></i>
                      <span>Thanh toán ZaloPay</span>
                    </div>
                  )}
                </button>
              </div>
            )}

            {paymentStatus === 'processing' && paymentData && (
              <div className="text-center">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Quét mã QR để thanh toán
                  </h3>
                  
                  {/* QR Code Placeholder */}
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 inline-block">
                    <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <i className="fas fa-qrcode text-6xl text-gray-400 mb-2"></i>
                        <p className="text-sm text-gray-500">Mã QR ZaloPay</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={handleOpenZaloPay}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <i className="fas fa-external-link-alt"></i>
                      <span>Mở ZaloPay để thanh toán</span>
                    </button>

                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-gray-600">Đang chờ thanh toán...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentStatus === 'completed' && (
              <div className="text-center py-8">
                <div className="text-green-500 text-6xl mb-4">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Thanh toán thành công!
                </h3>
                <p className="text-gray-600 mb-4">
                  Đơn hàng của bạn đã được thanh toán thành công
                </p>
                <p className="text-sm text-gray-500">
                  Đang chuyển hướng đến trang xác nhận...
                </p>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="text-center py-8">
                <div className="text-red-500 text-6xl mb-4">
                  <i className="fas fa-times-circle"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Thanh toán thất bại
                </h3>
                <p className="text-red-600 mb-6">{error}</p>
                <div className="space-x-4">
                  <button
                    onClick={handleRetry}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Thử lại
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Cancel Button */}
            {(paymentStatus === 'pending' || paymentStatus === 'processing') && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700 text-sm underline"
                >
                  Hủy và quay lại giỏ hàng
                </button>
              </div>
            )}
          </div>

          {/* Instructions */}
          {paymentStatus === 'processing' && (
            <div className="bg-blue-50 p-6">
              <h4 className="font-semibold text-gray-800 mb-3">
                <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                Hướng dẫn thanh toán
              </h4>
              <ol className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">1</span>
                  Mở ứng dụng ZaloPay trên điện thoại của bạn
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">2</span>
                  Chọn "Quét mã QR" và quét mã QR phía trên
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">3</span>
                  Hoặc nhấn nút "Mở ZaloPay" để thanh toán trực tiếp
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">4</span>
                  Xác nhận thanh toán trong ứng dụng ZaloPay
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">5</span>
                  Hệ thống sẽ tự động cập nhật trạng thái đơn hàng
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZaloPayCheckout;
