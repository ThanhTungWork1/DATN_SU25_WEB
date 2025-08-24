// src/api/order.ts

// Thay đổi từ import axios sang import axiosInstance
import axiosInstance from "../utils/axiosInstance";
import { Order, OrderItem } from "../types/Order";

// Xóa BASE_URL ở đây, vì chúng ta đã cấu hình nó trong axiosInstance
// const BASE_URL = "http://localhost:3000";

// API cho Orders (Admin Routes)
export const getOrders = (
  params: {
    page?: number;
    search?: string;
    status?: string;
    is_paid?: boolean;
    date_from?: string;
    date_to?: string;
  } = {}
) => {
  // Gửi các tham số đến backend
  return axiosInstance.get("/admin/orders", { params });
};

export const getOrderStatistics = () => {
  return axiosInstance.get("/admin/orders/statistics");
};

export const exportOrders = (
  params: {
    search?: string;
    status?: string;
    is_paid?: boolean;
  } = {}
) => {
  return axiosInstance.get("/admin/orders/export", {
    params,
    responseType: "blob",
  });
};
export const getOrder = (id: string | number) =>
  axiosInstance.get<{ status: string; message: string; data: Order }>(
    `/admin/orders/${id}`
  );
export const createOrder = (
  data: Omit<Order, "id" | "created_at" | "updated_at">
) => {
  return axiosInstance.post<Order>(`/admin/orders`, data);
};
export const updateOrder = (id: number, data: Partial<Order>) => {
  return axiosInstance.put(`/admin/orders/${id}`, data);
};
export const deleteOrder = (id: string | number) =>
  axiosInstance.delete<void>(`/admin/orders/${id}`);

// API cho Order Items (Đường dẫn từ routes/api.php có thể cần xác thực)
export const getOrderItems = (orderId: string | number) =>
  axiosInstance.get<OrderItem[]>(`/orderItems?order_id=${orderId}`);
export const getOrderItem = (id: string | number) =>
  axiosInstance.get<OrderItem>(`/orderItems/${id}`);
export const createOrderItem = (
  data: Omit<OrderItem, "id" | "created_at" | "updated_at">
) => axiosInstance.post<OrderItem>(`/orderItems`, data);
export const updateOrderItem = (
  id: string | number,
  data: Partial<OrderItem>
) => axiosInstance.put<OrderItem>(`/orderItems/${id}`, data);
export const deleteOrderItem = (id: string | number) =>
  axiosInstance.delete<void>(`/orderItems/${id}`);

// API cho Client Orders
export const getClientOrders = (
  params: {
    page?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
  } = {}
) => {
  return axiosInstance.get("/client/orders", { params });
};

export const getClientOrder = (id: string | number) =>
  axiosInstance.get(`/client/orders/${id}`);

export const confirmOrderReceived = (id: string | number) => {
  return axiosInstance.post(`/client/orders/${id}/confirm-received`);
};
