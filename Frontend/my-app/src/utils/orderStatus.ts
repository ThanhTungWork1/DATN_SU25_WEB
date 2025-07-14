// src/utils/orderStatus.ts

import { Order } from "../types/ProductType"; 
import { TagProps } from "antd";

// Danh sách trạng thái đơn hàng 
export const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Chờ xác nhận" }, // Đã sửa từ pending_confirmation
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "processing", label: "Đang xử lý" },
  { value: "shipping", label: "Đang giao hàng" },
  { value: "delivered", label: "Đã giao hàng" },
  { value: "cancelled", label: "Đã huỷ" },
  { value: "completed", label: "Đã hoàn thành" }, // Thêm trạng thái 'completed'
];

// Hàm lấy màu cho Tag trạng thái đơn hàng
export const getOrderStatusColor = (status: Order['status'] | string): TagProps['color'] => {
  switch (status) {
    case "pending": return "default"; // Màu xám nhạt (cho 'pending')
    case "confirmed": return "blue"; // Màu xanh dương
    case "processing": return "processing"; // Ant Design có màu 'processing'
    case "shipping": return "warning"; // Màu cam/vàng
    case "delivered": return "success"; // Màu xanh lá cây
    case "completed": return "green"; // Màu xanh lá cây (cho 'completed')
    case "cancelled": return "error"; // Màu đỏ
    default: return "default";
  }
};

// Hàm hiển thị văn bản cho trạng thái đơn hàng
export const getOrderStatusText = (status: Order['status'] | string): string => {
  switch (status) {
    case "pending": return "Chờ xác nhận";
    case "confirmed": return "Đã xác nhận";
    case "processing": return "Đang xử lý";
    case "shipping": return "Đang giao hàng";
    case "delivered": return "Đã giao hàng";
    case "completed": return "Đã hoàn thành";
    case "cancelled": return "Đã huỷ";
    default: return "Không rõ";
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

// Hàm lấy màu cho Tag trạng thái thanh toán
export const getPaymentStatusColor = (isPaid: boolean | number): TagProps["color"] => {
  if (isPaid === true || isPaid === 1) {
    return "green"; // Đã thanh toán
  }
  if (isPaid === false || isPaid === 0) {
    return "red"; // Chưa thanh toán
  }
  return "default"; // Mặc định nếu không rõ
};

// Hàm hiển thị văn bản cho trạng thái thanh toán
export const getPaymentStatusText = (isPaid: boolean | number): string => {
  if (isPaid === true || isPaid === 1) {
    return "Đã thanh toán";
  }
  if (isPaid === false || isPaid === 0) {
    return "Chưa thanh toán";
  }
  return "Không rõ";
};