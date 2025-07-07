// src/api/order.ts

import axios from "axios";
import { Order, OrderItem } from "../types/Order"; 

const BASE_URL = "http://localhost:3000"; 

// API cho Orders
export const getOrders = () => axios.get<Order[]>(`${BASE_URL}/orders`);
export const getOrder = (id: string | number) => axios.get<Order>(`${BASE_URL}/orders/${id}`);
export const createOrder = (data: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => axios.post<Order>(`${BASE_URL}/orders`, data);
export const updateOrder = (id: string | number, data: Partial<Order>) => axios.put<Order>(`${BASE_URL}/orders/${id}`, data);
export const deleteOrder = (id: string | number) => axios.delete<void>(`${BASE_URL}/orders/${id}`);

// API cho Order Items
export const getOrderItems = (orderId: string | number) => axios.get<OrderItem[]>(`${BASE_URL}/orderItems?order_id=${orderId}`);
export const getOrderItem = (id: string | number) => axios.get<OrderItem>(`${BASE_URL}/orderItems/${id}`);
export const createOrderItem = (data: Omit<OrderItem, 'id' | 'created_at' | 'updated_at'>) => axios.post<OrderItem>(`${BASE_URL}/orderItems`, data);
export const updateOrderItem = (id: string | number, data: Partial<OrderItem>) => axios.put<OrderItem>(`${BASE_URL}/orderItems/${id}`, data);
export const deleteOrderItem = (id: string | number) => axios.delete<void>(`${BASE_URL}/orderItems/${id}`);