// Business Logic for Order Status and Payment Status Validation

export interface OrderValidationRule {
  orderStatus: string;
  allowedPaymentStatuses: boolean[];
  paymentStatus: boolean;
  allowedOrderStatuses: string[];
}

/**
 * Định nghĩa quy tắc business logic cho trạng thái đơn hàng và thanh toán
 */
export const ORDER_PAYMENT_RULES = {
  // COD Orders - Thanh toán khi nhận hàng
  COD: {
    // Chỉ được thanh toán KHI đã giao hàng thành công
    canPaidWhen: ["delivered", "completed"],
    // Không được thanh toán KHI chưa giao
    cannotPaidWhen: [
      "pending",
      "confirmed",
      "processing",
      "shipping",
      "cancelled",
    ],
  },

  // Online Payment - Thanh toán trước
  ONLINE: {
    // Phải thanh toán TRƯỚC khi xử lý
    mustPaidBefore: [
      "confirmed",
      "processing",
      "shipping",
      "delivered",
      "completed",
    ],
    // Không được xử lý KHI chưa thanh toán
    cannotProcessWhen: false, // is_paid = false
  },
};

/**
 * Kiểm tra xem có thể thay đổi trạng thái thanh toán không
 */
export function canChangePaymentStatus(
  currentOrderStatus: string,
  currentPaymentStatus: boolean,
  newPaymentStatus: boolean,
  paymentMethod: string
): { allowed: boolean; reason?: string; autoUpdateOrderStatus?: string } {
  // Không cho phép thay đổi nếu giống trạng thái hiện tại
  if (currentPaymentStatus === newPaymentStatus) {
    return { allowed: false, reason: "Trạng thái thanh toán không thay đổi" };
  }

  // Chỉ cho phép thay đổi thanh toán khi đã giao hàng
  if (currentOrderStatus !== "delivered") {
    return {
      allowed: false,
      reason: "Chỉ được thay đổi thanh toán khi đơn hàng đã giao hàng",
    };
  }

  // Quy tắc cho COD
  if (paymentMethod === "COD") {
    // Muốn đánh dấu ĐÃ THANH TOÁN
    if (newPaymentStatus === true) {
      return {
        allowed: true,
        reason: "Đánh dấu đã thanh toán và tự động chuyển sang 'Đã hoàn thành'",
        autoUpdateOrderStatus: "completed",
      };
    }

    // Muốn đánh dấu CHƯA THANH TOÁN
    if (newPaymentStatus === false) {
      return {
        allowed: true,
        reason: "Đánh dấu chưa thanh toán",
      };
    }
  }

  // Quy tắc cho Online Payment
  if (paymentMethod === "BANK_TRANSFER" || paymentMethod === "CREDIT_CARD") {
    // Online đã thanh toán trước, chỉ cho phép giữ nguyên
    return {
      allowed: false,
      reason: "Đơn hàng online đã thanh toán trước, không thể thay đổi",
    };
  }

  return { allowed: true };
}

/**
 * Kiểm tra xem có thể thay đổi trạng thái đơn hàng không
 */
export function canChangeOrderStatus(
  currentOrderStatus: string,
  currentPaymentStatus: boolean,
  newOrderStatus: string,
  paymentMethod: string
): { allowed: boolean; reason?: string } {
  // Không cho phép thay đổi nếu giống trạng thái hiện tại
  if (currentOrderStatus === newOrderStatus) {
    return { allowed: false, reason: "Trạng thái đơn hàng không thay đổi" };
  }

  // Quy tắc cho Online Payment - phải thanh toán trước
  if (paymentMethod === "BANK_TRANSFER" || paymentMethod === "CREDIT_CARD") {
    if (
      !currentPaymentStatus &&
      ORDER_PAYMENT_RULES.ONLINE.mustPaidBefore.includes(newOrderStatus)
    ) {
      return {
        allowed: false,
        reason:
          "Đơn hàng thanh toán online phải được thanh toán trước khi xử lý",
      };
    }
  }

  // Quy tắc chung - không được quay lại trạng thái trước (trừ cancelled)
  const statusFlow = [
    "pending",
    "confirmed",
    "processing",
    "shipping",
    "delivered",
    "completed",
  ];
  const currentIndex = statusFlow.indexOf(currentOrderStatus);
  const newIndex = statusFlow.indexOf(newOrderStatus);

  if (newOrderStatus !== "cancelled" && newIndex < currentIndex) {
    return {
      allowed: false,
      reason: "Không thể quay lại trạng thái trước đó trong quy trình xử lý",
    };
  }

  return { allowed: true };
}

/**
 * Lấy trạng thái thanh toán được phép cho một trạng thái đơn hàng
 */
export function getAllowedPaymentStatuses(
  orderStatus: string,
  paymentMethod: string
): boolean[] {
  // Chỉ cho phép thay đổi thanh toán khi đã giao hàng
  if (orderStatus !== "delivered") {
    return []; // Không cho phép thay đổi
  }

  if (paymentMethod === "COD") {
    return [true, false]; // Cho phép cả paid và unpaid khi đã giao hàng
  }

  if (paymentMethod === "BANK_TRANSFER" || paymentMethod === "CREDIT_CARD") {
    return [true]; // Online đã thanh toán trước, chỉ cho phép giữ nguyên
  }

  return [true, false]; // Mặc định cho phép cả hai
}

/**
 * Lấy trạng thái đơn hàng được phép cho một trạng thái thanh toán
 * Có disable workflow - không cho quay lại trạng thái trước
 */
export function getAllowedOrderStatuses(
  paymentStatus: boolean,
  paymentMethod: string,
  currentStatus?: string
): string[] {
  const allStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipping",
    "delivered",
    "completed",
    "cancelled",
  ];

  // Workflow progression (không cho quay lại)
  const statusFlow = [
    "pending",
    "confirmed",
    "processing",
    "shipping",
    "delivered",
    "completed",
  ];
  const currentIndex = currentStatus ? statusFlow.indexOf(currentStatus) : -1;

  let allowedStatuses = allStatuses;

  // Business rules dựa trên payment method
  if (paymentMethod === "BANK_TRANSFER" || paymentMethod === "CREDIT_CARD") {
    if (!paymentStatus) {
      allowedStatuses = ["pending", "cancelled"]; // Chưa thanh toán chỉ cho phép pending hoặc cancelled
    } else {
      allowedStatuses = [
        "confirmed",
        "processing",
        "shipping",
        "delivered",
        "completed",
        "cancelled",
      ];
    }
  }

  // Disable previous statuses in workflow (trừ cancelled)
  if (currentIndex >= 0) {
    allowedStatuses = allowedStatuses.filter((status) => {
      if (status === "cancelled") return true; // Luôn cho phép cancel

      const statusIndex = statusFlow.indexOf(status);
      if (statusIndex === -1) return true; // Status không trong flow thì cho phép

      // Chỉ cho phép bước tiếp theo trong workflow (không cho nhảy bước)
      return statusIndex === currentIndex + 1;
    });
  }

  // Đặc biệt: Đã hủy chỉ cho phép refunded (không cho completed)
  if (currentStatus === "cancelled") {
    allowedStatuses = allowedStatuses.filter(
      (status) => status === "cancelled" || status === "refunded"
    );
  }

  // Đặc biệt: Đã hoàn tiền là trạng thái cuối cùng, không cho phép thay đổi
  if (currentStatus === "refunded") {
    allowedStatuses = ["refunded"]; // Chỉ cho phép chọn lại chính nó
  }

  return allowedStatuses;
}

/**
 * Tự động xác định payment status dựa trên order status và payment method
 */
export function getAutoPaymentStatus(
  orderStatus: string,
  paymentMethod: string
): boolean | null {
  // COD: Auto paid khi delivered
  if (paymentMethod === "COD") {
    if (orderStatus === "delivered" || orderStatus === "completed") {
      return true; // Auto đánh dấu đã thanh toán
    }
    if (
      ["pending", "confirmed", "processing", "shipping"].includes(orderStatus)
    ) {
      return false; // Auto đánh dấu chưa thanh toán
    }
  }

  // Online payment: phải thanh toán trước
  if (paymentMethod === "BANK_TRANSFER" || paymentMethod === "CREDIT_CARD") {
    if (
      [
        "confirmed",
        "processing",
        "shipping",
        "delivered",
        "completed",
      ].includes(orderStatus)
    ) {
      return true; // Phải đã thanh toán
    }
  }

  return null; // Không auto, để user quyết định
}

/**
 * Kiểm tra xem có nên auto-update payment status không
 */
export function shouldAutoUpdatePayment(
  oldOrderStatus: string,
  newOrderStatus: string,
  paymentMethod: string
): { shouldUpdate: boolean; newPaymentStatus?: boolean; reason?: string } {
  // COD: Auto paid khi chuyển thành delivered
  if (paymentMethod === "COD") {
    if (oldOrderStatus !== "delivered" && newOrderStatus === "delivered") {
      return {
        shouldUpdate: true,
        newPaymentStatus: true,
        reason: "COD tự động đánh dấu đã thanh toán khi giao hàng thành công",
      };
    }

    if (oldOrderStatus !== "completed" && newOrderStatus === "completed") {
      return {
        shouldUpdate: true,
        newPaymentStatus: true,
        reason: "Đơn hàng hoàn thành, tự động đánh dấu đã thanh toán",
      };
    }
  }

  // Online: Auto paid khi chuyển từ pending sang confirmed
  if (paymentMethod === "BANK_TRANSFER" || paymentMethod === "CREDIT_CARD") {
    if (oldOrderStatus === "pending" && newOrderStatus === "confirmed") {
      return {
        shouldUpdate: true,
        newPaymentStatus: true,
        reason: "Đơn hàng online được xác nhận, tự động đánh dấu đã thanh toán",
      };
    }
  }

  return { shouldUpdate: false };
}
