import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../../../hook/useOrders";
import OrderItem from "./OrderItem";
import { UseOrder } from "../../../types/UseOrder";
import "../../../assets/styles/OrderList.css";

const OrderList = () => {
  const [status, setStatus] = useState<string>("all");
  const navigate = useNavigate();
  const { getOrders, getOrdersByStatus, cancelOrder, reorder } = useOrders();

  const allOrdersQuery = getOrders(status === "all");
  const statusOrdersQuery = getOrdersByStatus(status);
  const activeQuery = status === "all" ? allOrdersQuery : statusOrdersQuery;
  const orders = Array.isArray(activeQuery.data) ? activeQuery.data : [];
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;

  const handleCancel = (id: number) => {
    if (window.confirm("Bạn chắc chắn muốn huỷ đơn hàng này?")) {
      cancelOrder.mutate(id);
    }
  };

  const handleReorder = (order: UseOrder) => {
    if (
      window.confirm(
        "Bạn có muốn thêm tất cả sản phẩm từ đơn hàng này vào giỏ hàng?"
      )
    ) {
      reorder.mutate(order, {
        onSuccess: () => {
          alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
          navigate("/cart");
        },
        onError: () => {
          alert("Có lỗi xảy ra khi thêm vào giỏ hàng!");
        },
      });
    }
  };

  if (isLoading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span className="loading-text">Đang tải đơn hàng...</span>
      </div>
    );

  if (isError)
    return (
      <div className="error-message">
        <p>Lỗi tải đơn hàng!</p>
      </div>
    );

  return (
    <div className="order-list-container">
      <div className="order-list-header">
        <h1 className="order-list-title">Lịch sử đơn hàng</h1>
        <p className="order-list-subtitle">
          Theo dõi trạng thái và quản lý đơn hàng của bạn
        </p>
      </div>

      <div className="order-list-filter">
                <select
          onChange={(e) => setStatus(e.target.value)}
          value={status}
          className="order-list-select"
        >
          <option value="all">Tất cả đơn hàng</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="processing">Đang xử lý</option>
          <option value="shipped">Đang giao hàng</option>
          <option value="delivered">Đã giao</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="order-empty">
          <div className="order-empty-icon">📦</div>
          <h3 className="order-empty-title">Chưa có đơn hàng nào</h3>
          <p className="order-empty-subtitle">
            Hãy mua sắm để tạo đơn hàng đầu tiên của bạn!
          </p>
          <button onClick={() => navigate("/")} className="order-empty-button">
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="orders-list">
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
