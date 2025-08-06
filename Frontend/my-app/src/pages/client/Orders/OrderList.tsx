import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../../hook/useOrders';
import OrderItem from './OrderItem';
import { UseOrder } from '../../../types/UseOrder';
import '../../../assets/styles/OrderList.css';

const OrderList = () => {
  const [status, setStatus] = useState<string>('all');
  const navigate = useNavigate();
  const { getOrders, getOrdersByStatus, cancelOrder, reorder } = useOrders();

  const allOrdersQuery = getOrders();
  const statusOrdersQuery = getOrdersByStatus(status);

  const activeQuery = status === 'all' ? allOrdersQuery : statusOrdersQuery;

  const orders = Array.isArray(activeQuery.data) ? activeQuery.data : [];
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;

  const handleCancel = (id: number) => {
    if (window.confirm('Bạn chắc chắn muốn huỷ đơn hàng này?')) {
      cancelOrder.mutate(id);
    }
  };

  const handleReorder = (order: UseOrder) => {
    if (window.confirm('Bạn có muốn thêm tất cả sản phẩm từ đơn hàng này vào giỏ hàng?')) {
      reorder.mutate(order, {
        onSuccess: () => {
          alert('Đã thêm sản phẩm vào giỏ hàng thành công!');
          navigate('/cart');
        },
        onError: () => {
          alert('Có lỗi xảy ra khi thêm vào giỏ hàng!');
        }
      });
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2">Đang tải đơn hàng...</span>
    </div>
  );
  
  if (isError) return (
    <div className="text-center py-8 text-red-500">
      <p>Lỗi tải đơn hàng!</p>
    </div>
  );

  return (

    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Lịch sử đơn hàng</h1>
        <p className="text-gray-600">Theo dõi trạng thái và quản lý đơn hàng của bạn</p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          onChange={(e) => setStatus(e.target.value)}
          value={status}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả đơn hàng</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="processing">Đang xử lý</option>
          <option value="shipped">Đang giao</option>
          <option value="delivered">Đã nhận</option>
          <option value="cancelled">Đã huỷ</option>
        </select>
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">Chưa có đơn hàng nào</h3>
          <p className="text-gray-600 mb-4">Hãy mua sắm để tạo đơn hàng đầu tiên của bạn!</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderItem 
              key={order.id} 
              order={order} 
              onCancel={handleCancel}
              onReorder={handleReorder}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;
