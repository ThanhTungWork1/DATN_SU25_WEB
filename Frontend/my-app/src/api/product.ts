// src/api/product.ts

import axios from "axios";
import { Product, ProductVariant, Color, Size, Category } from "../types/ProductType";

const BASE_URL = "http://localhost:3000"; // URL 

// API cho Products
export const getProducts = () => axios.get<Product[]>(`${BASE_URL}/products`);
export const getProduct = (id: string | number) => axios.get<Product>(`${BASE_URL}/products/${id}`);
export const updateProduct = (id: string | number, data: Partial<Product>) => axios.put<Product>(`${BASE_URL}/products/${id}`, data);
export const createProduct = (data: Product) => axios.post<Product>(`${BASE_URL}/products`, data);
export const deleteProduct = (id: string | number) => axios.delete<void>(`${BASE_URL}/products/${id}`);

// API cho Categories
export const getCategories = () => axios.get<Category[]>(`${BASE_URL}/categories`);
export const getCategory = (id: string | number) => axios.get<Category>(`${BASE_URL}/categories/${id}`);

// API cho Colors
export const getColors = () => axios.get<Color[]>(`${BASE_URL}/colors`);
export const getColor = (id: string | number) => axios.get<Color>(`${BASE_URL}/colors/${id}`);

// API cho Sizes
export const getSizes = () => axios.get<Size[]>(`${BASE_URL}/sizes`);
export const getSize = (id: string | number) => axios.get<Size>(`${BASE_URL}/sizes/${id}`);

// API cho Product Variants (Quan trọng để quản lý tồn kho chi tiết)
export const getProductVariants = (productId: string | number) => axios.get<ProductVariant[]>(`${BASE_URL}/productVariants?product_id=${productId}`);
export const getProductVariant = (id: string | number) => axios.get<ProductVariant>(`${BASE_URL}/productVariants/${id}`);
export const createProductVariant = (data: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>) => axios.post<ProductVariant>(`${BASE_URL}/productVariants`, data);
export const updateProductVariant = (id: string | number, data: Partial<ProductVariant>) => axios.put<ProductVariant>(`${BASE_URL}/productVariants/${id}`, data);
export const deleteProductVariant = (id: string | number) => axios.delete<void>(`${BASE_URL}/productVariants/${id}`);