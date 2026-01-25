import { useEffect, useState } from "react";
import { useOrders } from "../../../hook/useOrders";
import { formatCurrency } from "../../../utils/currencyFormatter";
import { TokenManager } from "../../../utils/tokenUtils";
import { checkReviewEligibility } from "../../../api/ApiUrl";
import { useOrderReviews } from "../../../hook/useOrderReviews";
import { Star } from "lucide-react";
import ReviewModal from "./ReviewModal";
import { differenceInMinutes, addMinutes } from "date-fns";

const OrderDetailModal = ({
  orderId,
  onClose,
}: {
  orderId: number;
  onClose: () => void;
}) => {
  const { getOrderDetail } = useOrders();
  const { data: order, isLoading } = getOrderDetail(orderId);

  // Lấy danh sách đánh giá cho đơn hàng này
  const { data: reviews = [], isLoading: reviewsLoading } =
    useOrderReviews(orderId);

  // Sử dụng formatCurrency từ utils thay vì formatVND local

  const getStatusColor = (status: string) => {
    // Kiểm tra xem đơn hàng waiting_for_payment có hết hạn chưa
    if (status === "waiting_for_payment" && order) {
      try {
        const createdAt = new Date(order.created_at);
        const expirationTime = addMinutes(createdAt, 60); // 60 minutes expiration
        const now = new Date();
        const diff = differenceInMinutes(expirationTime, now);
        if (diff <= 0) {
          return "status-badge status-cancelled";
        }
      } catch (e) {
        // Nếu có lỗi tính toán, giữ nguyên trạng thái gốc
      }
    }

    switch (status.toLowerCase()) {
      case "waiting_for_payment":
        return "status-badge status-waiting-payment";
      case "pending":
        return "status-badge status-pending";
      case "confirmed":
        return "status-badge status-confirmed";
      case "processing":
        return "status-badge status-processing";
      case "shipping":
        return "status-badge status-shipping";
      case "delivered":
        return "status-badge status-delivered";
      case "completed":
        return "status-badge status-completed";
      case "cancelled":
        return "status-badge status-cancelled";
      case "refunded":
        return "status-badge status-refunded";
      default:
        return "status-badge bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    // Kiểm tra xem đơn hàng waiting_for_payment có hết hạn chưa
    if (status === "waiting_for_payment" && order) {
      try {
        const createdAt = new Date(order.created_at);
        const expirationTime = addMinutes(createdAt, 60); // 60 minutes expiration
        const now = new Date();
        const diff = differenceInMinutes(expirationTime, now);
        if (diff <= 0) {
          return "Đã huỷ";
        }
      } catch (e) {
        // Nếu có lỗi tính toán, giữ nguyên trạng thái gốc
      }
    }

    switch (status.toLowerCase()) {
      case "waiting_for_payment":
        return "Chờ thanh toán";
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipping":
        return "Đang giao hàng";
      case "delivered":
        return "Đã giao";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã huỷ";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return status;
    }
  };
  const [reviewedProducts, setReviewedProducts] = useState<Set<number>>(
    new Set()
  );
  const [reviewModal, setReviewModal] = useState<{
    productId: number;
    productName: string;
    productImage?: string;
    orderId: number;
  } | null>(null);
  // Hàm hiển thị phương thức thanh toán
  const getPaymentMethodDisplay = () => {
    if (!order) return "";

    // 🔧 FIX: Kiểm tra trạng thái refunded trước
    if (order.status === "refunded") {
      return "Đã hoàn tiền";
    }

    // Hiển thị phương thức thanh toán dựa trên trạng thái thanh toán
    if (order.is_paid) {
      return "Thanh toán ngân hàng";
    } else {
      return "Thanh toán khi nhận hàng";
    }
  };

  // Hàm hiển thị trạng thái thanh toán
  const getPaymentStatusDisplay = () => {
    if (!order) return "";

    // 🔧 FIX: Kiểm tra trạng thái refunded trước
    if (order.status === "refunded") {
      return "Đã hoàn tiền";
    }

    // Hiển thị trạng thái thanh toán
    if (order.is_paid) {
      return "Đã thanh toán";
    } else {
      return "Chưa thanh toán";
    }
  };
  useEffect(() => {
    const checkReviewStatus = async () => {
      if (
        !order ||
        !["delivered", "completed"].includes(order.status.toLowerCase())
      )
        return;

      const token = TokenManager.getUserToken();
      if (!token) return;

      const reviewedSet = new Set<number>();

      for (const item of order.items) {
        try {
          const response = await checkReviewEligibility(
            item.product_id,
            token,
            order.id
          );
          if (
            (response.data as any).can_review === false &&
            (response.data as any).reason === "already_reviewed_for_order"
          ) {
            reviewedSet.add(item.product_id);
          }
        } catch (error: any) {
          console.error(
            `Error checking review status for product ${item.product_id}:`,
            error
          );
          // Nếu có lỗi server, bỏ qua sản phẩm này và tiếp tục
          if (error.response?.status === 500) {
            console.warn(
              `Skipping review status check for product ${item.product_id} due to server error`
            );
            continue;
          }
        }
      }

      setReviewedProducts(reviewedSet);
    };

    checkReviewStatus();
  }, [order, reviews, reviewsLoading]); // Thêm reviews và reviewsLoading vào dependency để refresh khi reviews thay đổi

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
                      Đơn giá: {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(
                        Number(item.price) * Number(item.quantity)
                      )}
                    </p>
                  </div>
                  {/* Nút đánh giá cho từng sản phẩm */}
                  {["delivered", "completed"].includes(
                    order.status.toLowerCase()
                  ) &&
                    !reviewedProducts.has(item.product_id) && (
                      <button
                        onClick={() =>
                          setReviewModal({
                            productId: item.product_id,
                            productName: item.product_name,
                            productImage: item.product_image,
                            orderId: order.id,
                          })
                        }
                        className="px-3 py-1.5 bg-orange-500 text-black text-xs rounded hover:bg-orange-600 transition-colors whitespace-nowrap flex items-center gap-1 border-none"
                        style={{ border: "none" }}
                        title="Đánh giá sản phẩm này"
                      >
                        ⭐ Đánh giá
                      </button>
                    )}

                  {/* Hiển thị trạng thái đã đánh giá */}
                  {["delivered", "completed"].includes(
                    order.status.toLowerCase()
                  ) &&
                    reviewedProducts.has(item.product_id) && (
                      <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded border border-green-200 whitespace-nowrap flex items-center gap-1">
                        ✅ Đã đánh giá
                      </span>
                    )}
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
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">
              Phương thức thanh toán
            </h4>
            <p className="text-gray-600">{getPaymentMethodDisplay()}</p>
          </div>

          {/* Trạng thái thanh toán */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">
              Trạng thái thanh toán
            </h4>
            <p className="text-gray-600">{getPaymentStatusDisplay()}</p>
          </div>

          {/* Ghi chú */}
          {order.note && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2">Ghi chú</h4>
              <p className="text-gray-600">{order.note}</p>
            </div>
          )}

          {/* Phần hiển thị đánh giá - chỉ hiện khi đơn hàng đã hoàn thành */}
          {reviews.length > 0 &&
            ["completed", "delivered"].includes(order.status.toLowerCase()) && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">Đánh giá của bạn</h4>
                <div className="space-y-4">
                  {reviewsLoading ? (
                    <div className="text-center text-gray-500">
                      Đang tải đánh giá...
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-gray-50 p-4 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {review.product?.name}
                          </span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={`${
                                  i < review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{review.content}</p>
                        <span className="text-sm text-gray-400">
                          Đánh giá vào:{" "}
                          {new Date(review.created_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          {/* Tổng tiền */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Tổng cộng:</span>
              <span>
                {formatCurrency(
                  (order as any).final_amount || order.total_price || 0
                )}
              </span>
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

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          productId={reviewModal.productId}
          productName={reviewModal.productName}
          productImage={reviewModal.productImage}
          orderId={reviewModal.orderId}
          isOpen={!!reviewModal}
          onClose={() => setReviewModal(null)}
          onReviewSubmitted={(productId) => {
            setReviewedProducts((prev) => new Set(prev).add(productId));
            // Refresh lại trạng thái đánh giá sau khi đánh giá thành công
            // Logic này sẽ được trigger bởi useEffect khi reviews thay đổi
          }}
        />
      )}
    </div>
  );
};

export default OrderDetailModal;
