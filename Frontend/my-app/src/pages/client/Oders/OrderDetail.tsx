import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Order } from "../../../types/DetailType";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3000/orders/${id}`)
      .then((res) => res.json())
      .then((data) => setOrder(data));
  }, [id]);

  if (!order) return <p>Đang tải...</p>;

  return (
    <div className="container my-5">
      <h3>Chi tiết đơn hàng #{order.id}</h3>
      <p>Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}</p>
      <p>Trạng thái: {order.status}</p>
      <p>Thanh toán: {order.paymentMethod || "Chưa thanh toán"}</p>

      <h5>Sản phẩm:</h5>
      <ul className="list-group">
        {order.items?.map((item) => (
          <li key={item.id} className="list-group-item d-flex justify-content-between">
            {item.name} x {item.quantity}
            <span>{(item.price * item.quantity).toLocaleString()} VND</span>
          </li>
        ))}
      </ul>

      <h5 className="mt-3">Tổng tiền: {order.totalAmount.toLocaleString()} VND</h5>
    </div>
  );
};

export default OrderDetail;
