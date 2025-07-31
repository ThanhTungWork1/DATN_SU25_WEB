import React from 'react';
import { UseOrder } from '../../../types/UseOrder'; // ✅ import đúng kiểu dữ liệu

type Props = {
  order: UseOrder; // ✅ dùng kiểu dữ liệu, không phải hook
  onCancel: (id: number) => void;
};

const OrderItem: React.FC<Props> = ({ order, onCancel }) => {
  return (
    <div className="border p-4 mb-4">
      <div>Mã đơn: #{order.id}</div>
      <div>Trạng thái: {order.status}</div>
      <div>Ngày tạo: {new Date(order.created_at).toLocaleString()}</div>
      <div>Tổng tiền: {order.total_price && order.total_price.toLocaleString()}₫</div>

      <button onClick={() => onCancel(order.id)}>Huỷ đơn</button>
    </div>
  );
};

export default OrderItem;
