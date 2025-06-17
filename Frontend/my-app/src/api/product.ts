import axios from "axios";

const API_URL = "http://localhost:3001/products";

export const getProducts = () => axios.get(API_URL);

export const getProduct = (id: string) => axios.get(`${API_URL}/${id}`);

export const updateProduct = (id: string, data: any) => axios.put(`${API_URL}/${id}`, data);

export const createProduct = (data: any) => axios.post(API_URL, data);

export const deleteProduct = (id: string) => axios.delete(`${API_URL}/${id}`);
