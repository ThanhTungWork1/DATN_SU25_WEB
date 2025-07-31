import React, { useState } from 'react';
import { useOrders } from '../../../hook/useOrders';
import OrderItem from './OrderItem';
import { UseOrder } from '../../../types/UseOrder';
import '../../../assets/styles/OrderList.css';

const OrderList = () => {
  const [status, setStatus] = useState<string>('all');
  const { getOrders, getOrdersByStatus, cancelOrder } = useOrders();

  const allOrdersQuery = getOrders();
  const statusOrdersQuery = getOrdersByStatus(status);

  // Chỉ gọi status API khi status khác 'all'
  const activeQuery = status === 'all' ? allOrdersQuery : statusOrdersQuery;

  const orders = Array.isArray(activeQuery.data) ? activeQuery.data : [];
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;

  const handleCancel = (id: number) => {
    if (window.confirm('Bạn chắc chắn muốn huỷ đơn hàng này?')) {
      cancelOrder.mutate(id);
    }
  };

  if (isLoading) return <p>Đang tải đơn hàng...</p>;
  if (isError) return <p>Lỗi tải đơn hàng!</p>;

  return (
    <div>
      <h1>Danh sách đơn hàng</h1>
      <select
        onChange={(e) => setStatus(e.target.value)}
        value={status}
        className="mb-4 border px-3 py-1 rounded"
      >
        <option value="all">Tất cả</option>
        <option value="pending">Chờ xác nhận</option>
        <option value="processing">Đang xử lý</option>
        <option value="shipped">Đang giao</option>
        <option value="delivered">Đã nhận</option>
        <option value="cancelled">Đã huỷ</option>
      </select>

      {orders.length === 0 ? (
        <p>Không có đơn hàng nào</p>
      ) : (
        orders.map((order) => (
          <OrderItem key={order.id} order={order} onCancel={handleCancel} />
        ))
      )}
      
    </div>
  );
};

export default OrderList;
