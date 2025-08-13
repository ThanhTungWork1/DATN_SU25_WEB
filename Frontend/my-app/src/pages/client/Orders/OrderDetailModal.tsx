import { useOrders } from "../../../hook/useOrders";

const OrderDetailModal = ({
  orderId,
  onClose,
}: {
  orderId: number;
  onClose: () => void;
}) => {
  const { getOrderDetail } = useOrders();
  const { data: order, isLoading } = getOrderDetail(orderId);

  // Định dạng tiền tệ VND chuẩn
  const formatVND = (value: unknown) => {
    const num = Number(value);
    if (!isFinite(num)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "shipping":
        return "text-purple-600 bg-purple-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Chờ xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipping":
        return "Đang giao";
      case "delivered":
        return "Đã nhận";
      case "cancelled":
        return "Đã huỷ";
      default:
        return status;
    }
  };

  if (isLoading)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-center">Đang tải chi tiết...</p>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-center text-red-500">Không tìm thấy đơn hàng.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Đóng
          </button>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold">
                Chi tiết đơn hàng #{order.id}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(order.created_at).toLocaleDateString("vi-VN")} -{" "}
                {new Date(order.created_at).toLocaleTimeString("vi-VN")}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mt-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
            >
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        {/* Thông tin đơn hàng */}
        <div className="p-6">
          {/* Danh sách sản phẩm */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Sản phẩm đã đặt</h4>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <img
                    src={item.product_image || "https://via.placeholder.com/80"}
                    alt={item.product_name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium">{item.product_name}</h5>
                    <p className="text-sm text-gray-500">
                      Số lượng: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Đơn giá: {formatVND(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatVND(Number(item.price) * Number(item.quantity))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thông tin giao hàng */}
          {order.shipping_address && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">Địa chỉ giao hàng</h4>
              <p className="text-gray-600">{order.shipping_address}</p>
            </div>
          )}

          {/* Phương thức thanh toán */}
          {order.payment_method && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">
                Phương thức thanh toán
              </h4>
              <p className="text-gray-600">{order.payment_method}</p>
            </div>
          )}

          {/* Ghi chú */}
          {order.note && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">Ghi chú</h4>
              <p className="text-gray-600">{order.note}</p>
            </div>
          )}

          {/* Tổng tiền */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Tổng cộng:</span>
              <span>{formatVND(order.total_price)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
