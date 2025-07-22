// src/api/product.ts

import axiosInstance from "../utils/axiosInstance";
import { Product, ProductVariant, Color, Size, Category } from "../types/ProductType"; 

// ====================================================================
// API cho Products (Admin Routes)
// ====================================================================

export const getProducts = () => axiosInstance.get<Product[]>(`/admin/products`);

export const getProduct = (id: string | number) => axiosInstance.get<Product>(`/admin/products/${id}`);

/**
 * TẠO MỚI sản phẩm.
 * Phải nhận vào kiểu 'FormData' để gửi file.
 */
export const createProduct = (data: FormData) => {
    return axiosInstance.post<Product>(`/admin/products`, data);
};

/**
 * CẬP NHẬT sản phẩm.
 * Phải nhận vào kiểu 'FormData' và dùng phương thức 'post'.
 */
export const updateProduct = (id: string | number, data: FormData) => {
    return axiosInstance.post<Product>(`/admin/products/${id}`, data);
};

export const deleteProduct = (id: string | number) => axiosInstance.delete<void>(`/admin/products/${id}`);


// ====================================================================
// API cho các tài nguyên khác (Giữ nguyên)
// ====================================================================

export const getCategories = () => axiosInstance.get<Category[]>(`/categories`);
export const getCategory = (id: string | number) => axiosInstance.get<Category>(`/categories/${id}`);

export const getColors = () => axiosInstance.get<Color[]>(`/colors`);
export const getColor = (id: string | number) => axiosInstance.get<Color>(`/colors/${id}`);

export const getSizes = () => axiosInstance.get<Size[]>(`/sizes`);
export const getSize = (id: string | number) => axiosInstance.get<Size>(`/sizes/${id}`);

export const getProductVariants = (productId: string | number) => axiosInstance.get<ProductVariant[]>(`/product-variants/${productId}`);
export const getProductVariant = (id: string | number) => axiosInstance.get<ProductVariant>(`/product-variants/${id}`);
export const createProductVariant = (data: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>) => axiosInstance.post<ProductVariant>(`/product-variants`, data);
export const updateProductVariant = (id: string | number, data: Partial<ProductVariant>) => axiosInstance.put<ProductVariant>(`/product-variants/${id}`, data);
export const deleteProductVariant = (id: string | number) => axiosInstance.delete<void>(`/product-variants/${id}`);
