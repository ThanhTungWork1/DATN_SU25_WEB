import axios from 'axios';
import type { Product } from '../types/DetailType';


export const getProductById = async (id: string): Promise<Product> => {
    const { data } = await axios.get(`http://localhost:3000/products/${id}`);
    return data as Product;
};

export const getAllProducts = async (): Promise<Product[]> => {
    const { data } = await axios.get(`http://localhost:3000/products`);
    return data as Product[];
};
