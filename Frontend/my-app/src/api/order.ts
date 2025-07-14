// src/api/order.ts

// Thay đổi từ import axios sang import axiosInstance
import axiosInstance from "../utils/axiosInstance"; 
import { Order, OrderItem } from "../types/ProductType"; 

// Xóa BASE_URL ở đây, vì chúng ta đã cấu hình nó trong axiosInstance
// const BASE_URL = "http://localhost:3000"; 

// API cho Orders (Admin Routes)
export const getOrders = () => axiosInstance.get<Order[]>(`/admin/orders`);
export const getOrder = (id: string | number) => axiosInstance.get<Order>(`/admin/orders/${id}`);
export const createOrder = (data: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => axiosInstance.post<Order>(`/admin/orders`, data);
export const updateOrder = (id: string | number, data: Partial<Order>) => axiosInstance.put<Order>(`/admin/orders/${id}`, data);
export const deleteOrder = (id: string | number) => axiosInstance.delete<void>(`/admin/orders/${id}`);

// API cho Order Items (Đường dẫn từ routes/api.php có thể cần xác thực)
export const getOrderItems = (orderId: string | number) => axiosInstance.get<OrderItem[]>(`/orderItems?order_id=${orderId}`);
export const getOrderItem = (id: string | number) => axiosInstance.get<OrderItem>(`/orderItems/${id}`);
export const createOrderItem = (data: Omit<OrderItem, 'id' | 'created_at' | 'updated_at'>) => axiosInstance.post<OrderItem>(`/orderItems`, data);
export const updateOrderItem = (id: string | number, data: Partial<OrderItem>) => axiosInstance.put<OrderItem>(`/orderItems/${id}`, data);
export const deleteOrderItem = (id: string | number) => axiosInstance.delete<void>(`/orderItems/${id}`);