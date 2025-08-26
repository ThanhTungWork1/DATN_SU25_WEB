import React, { useState, useEffect } from "react";
import { differenceInHours, differenceInMinutes, addMinutes } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useRepay } from "../../../hook/useRepay";
import { useOrders } from "../../../hook/useOrders";
import { UseOrder } from "../../../types/UseOrder";
import { Clock, MessageCircle } from "lucide-react";
import OrderDetailModal from "./OrderDetailModal";
import RefundRequestModal from "./RefundRequestModal";
import { useOrderReviews } from "../../../hook/useOrderReviews";

const statusConfig: { [key: string]: { text: string; className: string } } = {
  waiting_for_payment: {
    text: "Chờ thanh toán",
    className: "status-badge status-waiting-payment",
  },
  pending: {
    text: "Chờ xác nhận",
    className: "status-badge status-pending",
  },
  confirmed: {
    text: "Đã xác nhận",
    className: "status-badge status-confirmed",
  },
  processing: {
    text: "Đang xử lý",
    className: "status-badge status-processing",
  },
  shipping: {
    text: "Đang giao hàng",
    className: "status-badge status-shipping",
  },
  delivered: {
    text: "Đã giao",
    className: "status-badge status-delivered",
  },
  completed: {
    text: "Đã hoàn thành",
    className: "status-badge status-completed",
  },
  cancelled: {
    text: "Đã hủy",
    className: "status-badge status-cancelled",
  },
  refunded: {
    text: "Đã hoàn tiền",
    className: "status-badge status-refunded",
  },
  default: {
    text: "Không xác định",
    className: "status-badge bg-gray-100 text-gray-800 border border-gray-200",
  },
};

type Props = {
  order: UseOrder;
  onCancel: (id: number) => void;
  onReorder: (order: UseOrder) => void;
};

const OrderItem: React.FC<Props> = ({ order, onCancel, onReorder }) => {
  const { repay, isRepaying } = useRepay();
  const { confirmReceived } = useOrders();
  const [showDetail, setShowDetail] = useState(false);
  const [refundInfo, setRefundInfo] = useState<{
    type: "cancel" | "return";
  } | null>(null);
  const [remainingTime, setRemainingTime] = useState("");
  const [shouldShowConfirmButton, setShouldShowConfirmButton] = useState(true);
  const [hasAutoConfirmed, setHasAutoConfirmed] = useState(false);
  const [localRefundStatus, setLocalRefundStatus] = useState<string | null>(
    null
  );
  // Lấy danh sách đánh giá cho đơn hàng này
  const { data: reviews = [] } = useOrderReviews(order.id);

  const currentStatus =
    statusConfig[order.status.toLowerCase()] || statusConfig.default;

  useEffect(() => {
    // Debug log để kiểm tra refund_request cho tất cả orders
    console.log("🔍 DEBUG Order #" + order.id + ":", {
      refund_request: order.refund_request,
      status: order.status,
      has_refund_request: !!order.refund_request,
    });

    // Reset local refund status khi order data thay đổi
    if (order.refund_request) {
      setLocalRefundStatus(null);
    }

    if (order.status === "waiting_for_payment") {
      const calculateRemainingTime = () => {
        try {
          const createdAt = new Date(order.created_at);
          const expirationTime = addMinutes(createdAt, 60); // 60 minutes expiration
          const now = new Date();
          const diff = differenceInMinutes(expirationTime, now);

          if (diff <= 0) {
            setRemainingTime("Đã hết hạn");
          } else {
            setRemainingTime(`Hết hạn sau: ${diff} phút`);
          }
        } catch (e) {
          console.error("Error calculating remaining time:", e);
          setRemainingTime(""); // Reset if date is invalid
        }
      };

      calculateRemainingTime();
      const interval = setInterval(calculateRemainingTime, 60000); // Update every minute

      return () => clearInterval(interval);
    }

    // TẠM THỜI TẮT LOGIC TỰ ĐỘNG - CHỈ DÙNG BACKEND JOB
    // Logic tự động xác nhận sau 3 ngày sẽ được xử lý bởi backend job
  }, [order.status, order.created_at]);

  const formatVNDCompact = (value: unknown) => {
    const num = Number(value);
    if (!isFinite(num)) return "0đ";
    const formatted = new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(num);
    return `${formatted}đ`;
  };

  const resolveOrderTotal = (o: UseOrder) => {
    // Sử dụng total_price để đồng bộ với modal chi tiết
    const total = Number(o.total_price);
    return isFinite(total) ? total : 0;
  };

  const actionsState = React.useMemo(() => {
    const status = order.status.toLowerCase();
    const isPaid =
      (order as any).is_paid === 1 || (order as any).is_paid === true;

    const canCancel = [
      "pending",
      "confirmed",
      "processing",
      "waiting_for_payment",
      // Đặc biệt cho COD: có thể hủy cho đến khi đang giao hàng
      ...(order.payment_method === "COD" ? ["shipping"] : []),
    ].includes(status);

    // Thông báo về khả năng hủy đơn hàng
    const getCancelMessage = () => {
      if (canCancel) {
        if (order.payment_method === "COD") {
          return "Có thể hủy cho đến khi đơn hàng được giao";
        }
        return "Có thể hủy đơn hàng";
      }
      return "Không thể hủy đơn hàng đã được giao";
    };
    const canReorder = [
      "delivered",
      "completed",
      "cancelled",
      "refunded",
    ].includes(status);
    const canRequestRefundForCancelledOrder = status === "cancelled" && isPaid;

    let canReturn = false;
    const isReturnableStatus = ["delivered", "completed"].includes(status);
    if (isReturnableStatus && order.updated_at) {
      try {
        const timeZone = "Asia/Ho_Chi_Minh";
        const now = toZonedTime(new Date(), timeZone);
        const completionDate = toZonedTime(
          new Date(order.updated_at),
          timeZone
        );
        const hoursDifference = differenceInHours(now, completionDate);
        if (hoursDifference <= 7 * 24) {
          canReturn = true;
        }
      } catch (error) {
        console.error(
          "Error parsing order date for return logic:",
          order.updated_at,
          error
        );
        canReturn = false;
      }
    }
    return {
      canCancel,
      canReorder,
      canReturn,
      canRequestRefundForCancelledOrder,
      isPaid,
      getCancelMessage,
    };
  }, [order]);

  return (
    <>
      <div className="border rounded-lg p-6 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Đơn hàng #{order.id}</h3>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString("vi-VN")} -{" "}
              {new Date(order.created_at).toLocaleTimeString("vi-VN")}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${currentStatus.className}`}
            >
              {currentStatus.text}
            </span>
            {order.status === "waiting_for_payment" && remainingTime && (
              <div className="flex items-center justify-end text-xs text-orange-600 mt-1">
                <Clock size={14} className="mr-1" />
                {remainingTime}
              </div>
            )}
          </div>
        </div>

        {/* Sản phẩm preview - Vertical Layout */}
        <div className="mb-4">
          <div className="order-items-preview">
            {order.items.slice(0, 5).map((item) => (
              <div key={item.id} className="order-item-preview">
                <img
                  src={
                    (item.product_image && item.product_image.startsWith("http")
                      ? item.product_image
                      : item.product_image
                        ? `http://localhost:8000/storage/${item.product_image}`
                        : null) || "https://via.placeholder.com/50"
                  }
                  alt={item.product_name}
                  className="order-item-image"
                />
                <div className="order-item-content">
                  <p className="order-item-name">{item.product_name}</p>
                  <p className="order-item-quantity">SL: {item.quantity}</p>
                </div>
              </div>
            ))}
            {order.items.length > 5 && (
              <div className="more-items-indicator">
                +{order.items.length - 5} sản phẩm khác
              </div>
            )}
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">
            Tổng: {formatVNDCompact(resolveOrderTotal(order))}
          </span>
          {/* Hiển thị số lượng đánh giá nếu có và đơn hàng đã hoàn thành */}
          {reviews.length > 0 &&
            ["completed", "delivered"].includes(order.status.toLowerCase()) && (
              <div className="flex items-center text-sm text-gray-600">
                <MessageCircle size={16} className="mr-1" />
                <span>{reviews.length} đánh giá</span>
              </div>
            )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap items-center">
          {/* Luôn hiển thị nút Xem chi tiết và Mua lại */}
          <button
            onClick={() => setShowDetail(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Xem chi tiết
          </button>

          {actionsState.canReorder && (
            <button
              onClick={() => onReorder(order)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Mua lại
            </button>
          )}

          {/* Hiển thị trạng thái refund nếu có */}
          {(order.refund_request || localRefundStatus) &&
            ((order.refund_request?.status || localRefundStatus) ===
            "refunded" ? (
              <button className="btn btn-success" disabled>
                Đã hoàn tiền
              </button>
            ) : (order.refund_request?.status || localRefundStatus) ===
              "approved" ? (
              <button className="btn btn-primary" disabled>
                Đã duyệt
              </button>
            ) : (order.refund_request?.status || localRefundStatus) ===
              "rejected" ? (
              <button className="btn btn-danger" disabled>
                Đã từ chối
              </button>
            ) : (
              <button className="btn btn-warning" disabled>
                Đang chờ duyệt
              </button>
            ))}

          {/* Nút xác nhận đã nhận hàng cho đơn đã giao */}
          {order.status === "delivered" && shouldShowConfirmButton && (
            <button
              onClick={() => {
                confirmReceived.mutate(order.id);
                setShouldShowConfirmButton(false);
              }}
              className="btn btn-info"
              disabled={confirmReceived.isPending}
            >
              {confirmReceived.isPending ? "Đang xử lý..." : "Đã nhận hàng"}
            </button>
          )}

          {/* Các nút khác chỉ hiển thị khi KHÔNG có refund_request */}
          {!order.refund_request && !localRefundStatus && (
            <>
              {order.status === "waiting_for_payment" &&
                remainingTime !== "Đã hết hạn" && (
                  <button
                    onClick={() => repay({ orderId: order.id })}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    disabled={isRepaying}
                  >
                    {isRepaying ? "Đang xử lý..." : "Thanh toán ngay"}
                  </button>
                )}

              {actionsState.canCancel && (
                <button
                  onClick={() => {
                    if (actionsState.isPaid) {
                      setRefundInfo({ type: "cancel" });
                    } else {
                      onCancel(order.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  title={actionsState.getCancelMessage()}
                >
                  Hủy đơn
                </button>
              )}

              {actionsState.canReturn && (
                <button
                  onClick={() => setRefundInfo({ type: "return" })}
                  className="btn btn-danger"
                >
                  Trả hàng / Hoàn tiền
                </button>
              )}

              {actionsState.canRequestRefundForCancelledOrder && (
                <button
                  onClick={() => setRefundInfo({ type: "cancel" })}
                  className="btn btn-warning"
                >
                  Yêu cầu hoàn tiền
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal chi tiết */}
      {showDetail && (
        <OrderDetailModal
          orderId={order.id}
          onClose={() => setShowDetail(false)}
        />
      )}

      {/* Modal hoàn tiền */}
      {refundInfo && (
        <RefundRequestModal
          order={order}
          refundType={refundInfo.type}
          onClose={() => setRefundInfo(null)}
          onRefundSuccess={() => setLocalRefundStatus("pending")}
        />
      )}
    </>
  );
};

export default OrderItem;
