import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';

interface ZaloPayQRPaymentProps {
  orderId: number;
  amount: number;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

interface PaymentData {
  success: boolean;
  pay_url: string;
  payment_id: number;
  amount: number;
  qr_code?: string;
  app_trans_id?: string;
}

const ZaloPayQRPayment: React.FC<ZaloPayQRPaymentProps> = ({
  orderId,
  amount,
  onSuccess,
  onError,
  onCancel
}) => {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'completed' | 'failed'>('pending');
  const [countdown, setCountdown] = useState(600); // 10 phút
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Tạo đơn hàng ZaloPay khi component mount
  useEffect(() => {
    createZaloPayOrder();
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Hết thời gian thanh toán
  useEffect(() => {
    if (countdown <= 0 && paymentStatus !== 'completed') {
      setPaymentStatus('failed');
      onError?.('Phiên thanh toán đã hết hạn');
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    }
  }, [countdown, paymentStatus]);

  const createZaloPayOrder = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('user_token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để thanh toán');
      }

      const response = await axios.post(
        `http://localhost:8000/api/payments/zalopay/create`,
        { order_id: orderId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setPaymentData(response.data);
        setPaymentStatus('checking');
        startStatusChecking();
      } else {
        throw new Error(response.data.error || 'Không thể tạo đơn thanh toán');
      }
    } catch (error: any) {
      console.error('Error creating ZaloPay order:', error);
      onError?.(error.response?.data?.error || error.message || 'Lỗi tạo đơn thanh toán');
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
          `http://localhost:8000/api/payments/zalopay/status/${orderId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.payment_status === 'completed') {
          setPaymentStatus('completed');
          clearInterval(interval);
          onSuccess?.(response.data);
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
      window.open(paymentData.pay_url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Đang tạo đơn thanh toán...</p>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 text-6xl mb-4">
          <i className="fas fa-times-circle"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Thanh toán thất bại
        </h3>
        <p className="text-gray-600 mb-6">
          Phiên thanh toán đã hết hạn hoặc có lỗi xảy ra
        </p>
        <div className="space-x-4">
          <button
            onClick={createZaloPayOrder}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'completed') {
    return (
      <div className="text-center p-8">
        <div className="text-green-500 text-6xl mb-4">
          <i className="fas fa-check-circle"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Thanh toán thành công!
        </h3>
        <p className="text-gray-600 mb-4">
          Đơn hàng của bạn đã được thanh toán thành công
        </p>
        <p className="text-sm text-gray-500">
          Hệ thống sẽ tự động chuyển hướng...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 text-center">
        <h3 className="text-lg font-semibold">Thanh toán ZaloPay</h3>
        <p className="text-sm text-blue-100 mt-1">
          Quét mã QR hoặc mở ứng dụng ZaloPay
        </p>
        <div className="mt-2 text-xl font-bold">
          {formatTime(countdown)}
        </div>
      </div>

      {/* QR Code Section */}
      <div className="p-6 text-center">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-4 inline-block">
          {paymentData?.pay_url ? (
            <QRCode 
              value={paymentData.pay_url} 
              size={200}
              level="M"
              includeMargin={true}
            />
          ) : (
            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="text-lg font-semibold text-gray-800">
            {amount?.toLocaleString('vi-VN')} VND
          </div>
          
          <p className="text-sm text-gray-600">
            Quét mã QR bằng ứng dụng ZaloPay để thanh toán
          </p>

          {/* Open ZaloPay Button */}
          <button
            onClick={handleOpenZaloPay}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <i className="fas fa-mobile-alt"></i>
            <span>Mở ứng dụng ZaloPay</span>
          </button>

          {/* Status */}
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-gray-600">Đang chờ thanh toán...</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 p-4">
        <h4 className="font-semibold text-gray-800 mb-2 text-sm">
          Hướng dẫn thanh toán:
        </h4>
        <ol className="text-xs text-gray-600 space-y-1">
          <li>1. Mở ứng dụng ZaloPay trên điện thoại</li>
          <li>2. Chọn "Quét mã QR" và quét mã trên</li>
          <li>3. Hoặc nhấn nút "Mở ứng dụng ZaloPay"</li>
          <li>4. Xác nhận thanh toán trong ứng dụng</li>
        </ol>
      </div>

      {/* Cancel Button */}
      <div className="p-4 border-t">
        <button
          onClick={onCancel}
          className="w-full text-gray-500 hover:text-gray-700 text-sm"
        >
          Hủy thanh toán
        </button>
      </div>
    </div>
  );
};

export default ZaloPayQRPayment;
