import React, { useState } from 'react';
import { useOrders } from '../../../hook/useOrders';
import OrderItem from './OrderItem';

const OrderList = () => {
  const [status, setStatus] = useState<string>('all');
  const { getOrders, getOrdersByStatus, cancelOrder } = useOrders();

  const {
    data: orders = [],
    isLoading,
    isError,
  } = status === 'all' ? getOrders() : getOrdersByStatus(status);

  const handleCancel = (id: number) => {
    if (window.confirm('Bạn chắc chắn muốn huỷ đơn hàng này?')) {
      cancelOrder.mutate(id);
    }
  };

  if (isLoading) return <p>Đang tải đơn hàng...</p>;
  if (isError) return <p>Lỗi tải đơn hàng!</p>;

  return (
    <div>
      <select
        onChange={(e) => setStatus(e.target.value)}
        value={status}
        className="mb-4 border px-3 py-1 rounded"
      >
        <option value="all">Tất cả</option>
        <option value="pending">Chờ xác nhận</option>
        <option value="shipping">Đang giao</option>
        <option value="completed">Đã nhận</option>
        <option value="canceled">Đã huỷ</option>
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
