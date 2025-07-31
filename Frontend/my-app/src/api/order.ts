// src/api/order.ts

import { axiosInstance } from "./index";
import { Order, OrderItem } from "../types/ProductType";

// API cho Orders (Admin Routes)
export const getOrders = (params: { page?: number, search?: string, status?: string } = {}) => {
    return axiosInstance.get('/admin/orders', { params });
};

export const getOrder = (id: string | number) => 
    axiosInstance.get<Order>(`/admin/orders/${id}`);

export const createOrder = (data: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => 
    axiosInstance.post<Order>(`/admin/orders`, data);

export const updateOrder = (id: number, data: Partial<Order>) => {
    return axiosInstance.put(`/admin/orders/${id}`, data);
};

export const deleteOrder = (id: string | number) => 
    axiosInstance.delete<void>(`/admin/orders/${id}`);

// API cho Client Orders (User Routes) 
export const getClientOrders = (params: { page?: number, status?: string, date_from?: string, date_to?: string } = {}) => {
    return axiosInstance.get('/client/orders', { params });
};

export const getClientOrder = (id: string | number) => 
    axiosInstance.get(`/client/orders/${id}`);

export const createClientOrder = (data: {
    shipping_address: string;
    shipping_phone: string;
    shipping_name: string;
    note?: string;
    items: Array<{
        variant_id: number;
        quantity: number;
        price: number;
    }>;
}) => axiosInstance.post('/client/orders', data);

export const updateClientOrder = (id: number, data: { status: 'cancelled' }) => 
    axiosInstance.put(`/client/orders/${id}`, data);

export const deleteClientOrder = (id: string | number) => 
    axiosInstance.delete<void>(`/client/orders/${id}`);

export const getClientOrdersByStatus = (status: string) => 
    axiosInstance.get(`/client/orders/status/${status}`);

export const getClientOrderStatistics = () => 
    axiosInstance.get('/client/orders/statistics');

// Legacy API (to be removed once frontend is updated)
export const getOrderItems = (orderId: string | number) => 
    axiosInstance.get<OrderItem[]>(`/orderItems?order_id=${orderId}`);

export const getOrderItem = (id: string | number) => 
    axiosInstance.get<OrderItem>(`/orderItems/${id}`);

export const createOrderItem = (data: Omit<OrderItem, 'id' | 'created_at' | 'updated_at'>) => 
    axiosInstance.post<OrderItem>(`/orderItems`, data);

export const updateOrderItem = (id: string | number, data: Partial<OrderItem>) => 
    axiosInstance.put<OrderItem>(`/orderItems/${id}`, data);

export const deleteOrderItem = (id: string | number) => 
    axiosInstance.delete<void>(`/orderItems/${id}`);