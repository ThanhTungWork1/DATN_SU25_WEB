import React from 'react';
import { useOrders } from '../../../hook/useOrders';

const OrderDetailModal = ({
  orderId,
  onClose,
}: {
  orderId: number;
  onClose: () => void;
}) => {
  const { getOrderDetail } = useOrders();
  const { data: order, isLoading } = getOrderDetail(orderId);

  if (isLoading) return <div>Đang tải chi tiết...</div>;
  if (!order) return <div>Không tìm thấy đơn hàng.</div>;

  return (
    <div className="modal">
      <h3>Chi tiết đơn #{order.id}</h3>
      <p>Trạng thái: {order.status}</p>
      <ul>
        {order.items?.map((item: any) => (
          <li key={item.id}>
            {item.name} x {item.quantity} – {item.price}₫
          </li>
        ))}
      </ul>
      <p>
        <strong>Tổng:</strong> {order.total}₫
      </p>
      <button onClick={onClose}>Đóng</button>
    </div>
  );
};

export default OrderDetailModal;
