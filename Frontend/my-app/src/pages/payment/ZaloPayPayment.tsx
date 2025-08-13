import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ZaloPayButton from '../../components/payment/ZaloPayButton';

interface OrderData {
  id: number;
  order_code: string;
  total_amount: number;
  shipping_fee: number;
  created_at: string;
}

interface LocationState {
  orderId: number;
  amount: number;
  orderData: OrderData;
}

const ZaloPayPayment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(600); // 10 minutes
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const state = location.state as LocationState;

  useEffect(() => {
    if (!state?.orderId) {
      navigate('/cart');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!paymentCompleted) {
            alert('Phiên thanh toán đã hết hạn');
            navigate('/cart');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state, navigate, paymentCompleted]);

  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentCompleted(true);
    
    // Navigate to success page
    navigate("/order-success", {
      state: {
        orderId: state.orderId,
        orderData: state.orderData,
        paymentData: paymentData,
        message: "Thanh toán ZaloPay thành công!"
      }
    });
  };

  const handlePaymentError = (error: string) => {
    alert(`Lỗi thanh toán: ${error}`);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Thanh toán ZaloPay</h1>
                <p className="text-blue-100 mt-1">
                  Đơn hàng #{state.orderData?.order_code || state.orderId}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Thời gian còn lại</div>
                <div className="text-2xl font-bold">
                  {formatTime(countdown)}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-6 border-b">
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
                  {state.orderData?.total_amount != null ? Number(state.orderData.total_amount).toLocaleString('vi-VN') : '0'} VND
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium">
                  {state.orderData?.shipping_fee != null ? Number(state.orderData.shipping_fee).toLocaleString('vi-VN') : '0'} VND
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-blue-600 pt-3 border-t">
                <span>Tổng thanh toán:</span>
                <span>{state.amount != null ? Number(state.amount).toLocaleString('vi-VN') : '0'} VND</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <i className="fas fa-mobile-alt text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Thanh toán qua ZaloPay
              </h3>
              <p className="text-gray-600 text-sm">
                Nhấn nút bên dưới để mở ứng dụng ZaloPay và hoàn tất thanh toán
              </p>
            </div>

            <div className="space-y-4">
              <ZaloPayButton
                orderId={state.orderId}
                amount={state.amount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                className="w-full text-lg py-4"
                disabled={paymentCompleted || countdown <= 0}
              />

              <div className="text-center">
                <button
                  onClick={() => navigate('/cart')}
                  className="text-gray-500 hover:text-gray-700 text-sm underline"
                >
                  Hủy và quay lại giỏ hàng
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 p-6">
            <h4 className="font-semibold text-gray-800 mb-3">
              <i className="fas fa-info-circle text-blue-600 mr-2"></i>
              Hướng dẫn thanh toán
            </h4>
            <ol className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">1</span>
                Nhấn nút "Thanh toán ZaloPay" để mở cửa sổ thanh toán
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">2</span>
                Đăng nhập vào tài khoản ZaloPay của bạn
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">3</span>
                Xác nhận thông tin và hoàn tất thanh toán
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">4</span>
                Hệ thống sẽ tự động cập nhật trạng thái đơn hàng
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZaloPayPayment;
