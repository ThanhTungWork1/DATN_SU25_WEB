import React, { useState } from 'react';
import axios from 'axios';

interface ZaloPayButtonProps {
  orderId: number;
  amount: number;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

const ZaloPayButton: React.FC<ZaloPayButtonProps> = ({
  orderId,
  amount,
  onSuccess,
  onError,
  className = '',
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleZaloPayPayment = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    
    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem('user_token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để thanh toán');
      }

      // Gọi API tạo đơn hàng ZaloPay
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payments/zalopay/create`,
        { order_id: orderId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success && response.data.pay_url) {
        // Mở trang thanh toán ZaloPay trong tab mới
        const paymentWindow = window.open(
          response.data.pay_url,
          'zalopay_payment',
          'width=800,height=600,scrollbars=yes,resizable=yes'
        );

        // Theo dõi trạng thái thanh toán
        const checkPaymentStatus = setInterval(async () => {
          try {
            const statusResponse = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/payments/zalopay/status/${orderId}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );

            if (statusResponse.data.status === 'completed') {
              clearInterval(checkPaymentStatus);
              if (paymentWindow) {
                paymentWindow.close();
              }
              onSuccess?.(statusResponse.data);
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
          }
        }, 3000); // Kiểm tra mỗi 3 giây

        // Dừng kiểm tra sau 10 phút
        setTimeout(() => {
          clearInterval(checkPaymentStatus);
          if (paymentWindow && !paymentWindow.closed) {
            paymentWindow.close();
          }
        }, 600000);

      } else {
        throw new Error(response.data.error || 'Không thể tạo đơn hàng thanh toán');
      }

    } catch (error: any) {
      console.error('ZaloPay payment error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Có lỗi xảy ra khi thanh toán';
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleZaloPayPayment}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center px-6 py-3 
        bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
        text-white font-medium rounded-lg
        transition-colors duration-200
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Đang xử lý...
        </>
      ) : (
        <>
          <img 
            src="/images/zalopay-logo.png" 
            alt="ZaloPay" 
            className="w-5 h-5 mr-2"
            onError={(e) => {
              // Fallback nếu không có logo
              e.currentTarget.style.display = 'none';
            }}
          />
          Thanh toán ZaloPay ({amount.toLocaleString('vi-VN')} VND)
        </>
      )}
    </button>
  );
};

export default ZaloPayButton;
