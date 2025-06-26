import { useEffect, useState } from "react";
import type { Order } from "../../../types/DetailType";

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch("http://localhost:3000/orders");
      const data = await res.json();
      setOrders(data);
    };
    fetchOrders();
  }, []);

  return (
    <div className="container my-5">
      <h3>Lịch sử đơn hàng</h3>
      {orders.length === 0 ? (
        <p>Không có đơn hàng.</p>
      ) : (
        <ul className="list-group">
          {orders.map((order) => (
            <li key={order.id} className="list-group-item">
              Mã đơn: #{order.id} | Tổng tiền: {order.totalAmount.toLocaleString()} VND
              <br />
              Ngày đặt: {new Date(order.createdAt).toLocaleDateString()} | Trạng thái: {order.status}
              <br />
              <a href={`/orders/${order.id}`}>Xem chi tiết</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderHistory;
