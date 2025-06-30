import axios from "axios";

const ORDER_API_URL = "http://localhost:3000/orders";

export const getOrders = () => axios.get(ORDER_API_URL);
export const getOrder = (id: string) => axios.get(`${ORDER_API_URL}/${id}`);
export const createOrder = (data: any) => axios.post(ORDER_API_URL, data);
export const updateOrder = (id: string, data: any) => axios.put(`${ORDER_API_URL}/${id}`, data);
export const deleteOrder = (id: string) => axios.delete(`${ORDER_API_URL}/${id}`);
