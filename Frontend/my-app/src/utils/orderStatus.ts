import { Order } from "../types/Order";
import { TagProps } from "antd";

// Danh sách trạng thái đơn hàng
export const ORDER_STATUS_OPTIONS = [
  { value: "pending_confirmation", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "processing", label: "Đang xử lý" },
  { value: "shipping", label: "Đang giao hàng" },
  { value: "delivered", label: "Đã giao hàng" },
  { value: "cancelled", label: "Đã huỷ" },
];

//lấy màu cho Tag trạng thái đơn hàng
export const getOrderStatusColor = (
  status: Order["status"]
): TagProps["color"] => {
  switch (status) {
    case "pending_confirmation":
      return "default"; // Màu xám nhạt
    case "confirmed":
      return "blue"; // Màu xanh dương
    case "processing":
      return "processing"; // Ant Design có màu 'processing'
    case "shipping":
      return "warning"; // Màu cam/vàng
    case "delivered":
      return "success"; // Màu xanh lá cây
    case "cancelled":
      return "error"; // Màu đỏ
    default:
      return "default";
  }
};

//hiển thị cho trạng thái đơn hàng
export const getOrderStatusText = (status: Order["status"]): string => {
  switch (status) {
    case "pending_confirmation":
      return "Chờ xác nhận";
    case "confirmed":
      return "Đã xác nhận";
    case "processing":
      return "Đang xử lý";
    case "shipping":
      return "Đang giao hàng";
    case "delivered":
      return "Đã giao hàng";
    case "cancelled":
      return "Đã huỷ";
    default:
      return "Không rõ";
  }
};

// Danh sách phương thức thanh toán
export const PAYMENT_METHOD_OPTIONS = [
  { value: "COD", label: "Thanh toán khi nhận hàng (COD)" },
  { value: "Bank Transfer", label: "Chuyển khoản ngân hàng" },
  { value: "Credit Card", label: "Thẻ tín dụng" },
];

// Danh sách trạng thái thanh toán
export const PAYMENT_STATUS_OPTIONS = [
  { value: "unpaid", label: "Chưa thanh toán" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "part_paid", label: "Thanh toán một phần" },
  { value: "refunded", label: "Đã hoàn tiền" },
];

//lấy màu cho Tag trạng thái thanh toán
export const getPaymentStatusColor = (
  status: Order["payment_status"]
): TagProps["color"] => {
  switch (status) {
    case "paid":
      return "green";
    case "unpaid":
      return "red";
    case "part_paid":
      return "gold";
    case "refunded":
      return "default";
    default:
      return "default";
  }
};

// hiển thị cho trạng thái thanh toán
export const getPaymentStatusText = (
  status: Order["payment_status"]
): string => {
  switch (status) {
    case "paid":
      return "Đã thanh toán";
    case "unpaid":
      return "Chưa thanh toán";
    case "part_paid":
      return "Thanh toán một phần";
    case "refunded":
      return "Đã hoàn tiền";
    default:
      return "Không rõ";
  }
};
