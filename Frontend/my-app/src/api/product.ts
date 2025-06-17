import axios from "axios"

const API_URL = "http://localhost:3001/products";

export const getProducts = () => axios.get(API_URL);
export const getProduct = (id: number) => axios.get(`${API_URL}/${id}`);
export const createProduct = (data: any) => axios.post(API_URL, data);
export const updateProduct = (id: number, data: any) => axios.put(`${API_URL}/${id}`, data);
export const deleteProduct = (id: number) => axios.delete(`${API_URL}/${id}`);

