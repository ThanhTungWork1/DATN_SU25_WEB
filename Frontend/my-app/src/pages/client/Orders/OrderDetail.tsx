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

  if (!order) return <div className="container my-5 text-center">Đang tải chi tiết đơn hàng...</div>;

  return (
    <div className="container my-5">
      <h3 className="fw-bold">📝 Chi tiết đơn hàng #{order.id}</h3>
      <hr />
      <p><strong>Ngày đặt:</strong> {new Date(order.createdAt || order.created_at || "").toLocaleString()}</p>
      <p><strong>Trạng thái:</strong> {order.status}</p>
      <p><strong>Thanh toán:</strong> {order.paymentMethod || "Chưa thanh toán"}</p>

      <h5 className="mt-4 fw-bold">Địa chỉ giao hàng:</h5>
      <p>
        {order.address?.street}, {order.address?.ward && `${order.address.ward}, `}
        {order.address?.district}, {order.address?.province}
      </p>

      <h5 className="mt-4 fw-bold">Sản phẩm:</h5>
      {order.items?.length ? (
        <ul className="list-group">
          {order.items.map((item) => (
            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                {item.name} x {item.quantity}
              </div>
              <span className="fw-bold text-danger">
                {(item.price * item.quantity).toLocaleString()} VND
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>Không có sản phẩm nào trong đơn hàng.</p>
      )}

      <h5 className="mt-4">Tổng tiền: <span className="text-danger fw-bold">{(order.totalAmount || order.total_amount || 0).toLocaleString()} VND</span></h5>
    </div>
  );
};

export default OrderDetail;
