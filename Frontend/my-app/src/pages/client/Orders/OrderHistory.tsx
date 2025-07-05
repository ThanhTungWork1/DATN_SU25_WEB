import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Order } from "../../../types/DetailType";

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  return (
    <div className="container my-5">
      <h2 className="fw-bold text-center mb-4">📦 Lịch sử đơn hàng</h2>
      {orders.length === 0 ? (
        <p className="text-center">Bạn chưa có đơn hàng nào.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
                <th>Thanh toán</th>
                <th>Tổng tiền</th>
                <th>Xem chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order.id}>
                  <td>{index + 1}</td>
                  <td>{new Date(order.createdAt || order.created_at || "").toLocaleString()}</td>
                  <td>
                    <span className={`badge ${order.status === "Chờ xử lý" ? "bg-warning" : "bg-success"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.paymentMethod || "Chưa thanh toán"}</td>
                  <td>{(order.totalAmount || order.total_amount || 0).toLocaleString()} VND</td>
                  <td>
                    <Link to={`/orders/${order.id}`} className="btn btn-sm btn-primary">
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
