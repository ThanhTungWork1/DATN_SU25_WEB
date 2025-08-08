import React, { useState, useEffect } from 'react';
import ZaloPayButton from '../../components/payment/ZaloPayButton';
import axios from 'axios';

interface Order {
  id: number;
  order_code: string;
  total_amount: number;
  shipping_fee: number;
  status: string;
  is_paid: boolean;
}

const ZaloPayTest: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Vui lòng đăng nhập để xem đơn hàng');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/orders`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Lọc các đơn hàng chưa thanh toán
      const unpaidOrders = response.data.data?.filter((order: Order) => !order.is_paid) || [];
      setOrders(unpaidOrders);
      
      if (unpaidOrders.length > 0) {
        setSelectedOrder(unpaidOrders[0]);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setMessage('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setMessage(`Thanh toán thành công! Payment ID: ${paymentData.payment_id}`);
    // Refresh orders
    fetchOrders();
  };

  const handlePaymentError = (error: string) => {
    setMessage(`Lỗi thanh toán: ${error}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Test Thanh Toán ZaloPay
          </h1>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('thành công') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Không có đơn hàng nào cần thanh toán</p>
              <button
                onClick={() => window.location.href = '/'}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Về trang chủ
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn đơn hàng cần thanh toán:
                </label>
                <select
                  value={selectedOrder?.id || ''}
                  onChange={(e) => {
                    const orderId = parseInt(e.target.value);
                    const order = orders.find(o => o.id === orderId);
                    setSelectedOrder(order || null);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      #{order.order_code} - {(order.total_amount + order.shipping_fee).toLocaleString('vi-VN')} VND
                    </option>
                  ))}
                </select>
              </div>

              {selectedOrder && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Thông tin đơn hàng:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Mã đơn hàng:</span>
                      <span className="ml-2 font-medium">#{selectedOrder.order_code}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className="ml-2 font-medium">{selectedOrder.status}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tổng tiền hàng:</span>
                      <span className="ml-2 font-medium">{selectedOrder.total_amount.toLocaleString('vi-VN')} VND</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phí vận chuyển:</span>
                      <span className="ml-2 font-medium">{selectedOrder.shipping_fee.toLocaleString('vi-VN')} VND</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Tổng thanh toán:</span>
                      <span className="ml-2 font-bold text-lg text-blue-600">
                        {(selectedOrder.total_amount + selectedOrder.shipping_fee).toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrder && (
                <div className="flex justify-center">
                  <ZaloPayButton
                    orderId={selectedOrder.id}
                    amount={selectedOrder.total_amount + selectedOrder.shipping_fee}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    className="w-full max-w-md"
                  />
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Hướng dẫn test:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. Chọn đơn hàng cần thanh toán từ dropdown</li>
              <li>2. Nhấn nút "Thanh toán ZaloPay"</li>
              <li>3. Cửa sổ thanh toán ZaloPay sẽ mở ra</li>
              <li>4. Sử dụng thông tin test của ZaloPay để thanh toán</li>
              <li>5. Hệ thống sẽ tự động cập nhật trạng thái</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZaloPayTest;
