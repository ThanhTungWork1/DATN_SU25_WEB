import React, { useState } from "react";
import { differenceInHours } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { UseOrder } from "../../../types/UseOrder";
import OrderDetailModal from "./OrderDetailModal";
import RefundRequestModal from "./RefundRequestModal";

const statusConfig: { [key: string]: { text: string; className: string } } = {
  pending: { text: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-800" },
  confirmed: { text: "Đã xác nhận", className: "bg-cyan-100 text-cyan-800" },
  processing: { text: "Đang xử lý", className: "bg-blue-100 text-blue-800" },
  shipped: {
    text: "Đang giao hàng",
    className: "bg-indigo-100 text-indigo-800",
  },
  delivered: { text: "Đã giao", className: "bg-purple-100 text-purple-800" },
  completed: {
    text: "Đã hoàn thành",
    className: "bg-green-100 text-green-800",
  },
  cancelled: { text: "Đã hủy", className: "bg-red-100 text-red-800" },
  default: { text: "Không xác định", className: "bg-gray-100 text-gray-800" },
};

type Props = {
  order: UseOrder;
  onCancel: (id: number) => void;
  onReorder: (order: UseOrder) => void;
};

const OrderItem: React.FC<Props> = ({ order, onCancel, onReorder }) => {
  console.log("Rendering OrderItem with order:", order);

  const [showDetail, setShowDetail] = useState(false);
  // State để quản lý việc hiển thị modal và loại yêu cầu (hủy hoặc trả hàng)
  const [refundInfo, setRefundInfo] = useState<{
    type: "cancel" | "return";
  } | null>(null);
  const currentStatus =
    statusConfig[order.status.toLowerCase()] || statusConfig.default;

  // Định dạng tiền VND theo yêu cầu: ví dụ "198.000đ" (không khoảng trắng)
  const formatVNDCompact = (value: unknown) => {
    const num = Number(value);
    if (!isFinite(num)) return "0đ";
    const formatted = new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(num);
    return `${formatted}đ`;
  };

  // Lấy tổng tiền trực tiếp từ total_price để đồng bộ với trang chi tiết
  const resolveOrderTotal = (o: UseOrder) => {
    const total = Number((o as any).total_price);
    return isFinite(total) ? total : 0;
  };

  const actionsState = React.useMemo(() => {
    const status = order.status.toLowerCase();
    const isPaid =
      (order as any).is_paid === 1 || (order as any).is_paid === true;

    const canCancel = ["pending", "confirmed", "processing"].includes(status);
    const canReorder = ["delivered", "completed", "cancelled"].includes(status);
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
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${currentStatus.className}`}
          >
            {currentStatus.text}
          </span>
        </div>

        {/* Sản phẩm preview */}
        <div className="mb-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {order.items.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 min-w-0 flex-shrink-0"
              >
                <img
                  src={item.product_image || "https://via.placeholder.com/50"}
                  alt={item.product_name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-gray-500">SL: {item.quantity}</p>
                </div>
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="flex items-center text-sm text-gray-500">
                +{order.items.length - 3} sản phẩm khác
              </div>
            )}
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold">
            Tổng: {formatVNDCompact(resolveOrderTotal(order))}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap items-center">
          {order.refund_request ? (
            <button
              className="px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed"
              disabled
            >
              Đang chờ xử lý
            </button>
          ) : (
            <>
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
        />
      )}
    </>
  );
};

export default OrderItem;
