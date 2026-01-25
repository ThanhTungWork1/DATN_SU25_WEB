// src/api/product.ts

import axiosInstance from "../utils/axiosInstance";
import { ApiResponse, Product, ProductVariant, Color, Size } from "../types/ProductType"; 

// ====================================================================
// API cho Products (Client Routes)
// ====================================================================

export const getClientProduct = (id: string | number) => axiosInstance.get<ApiResponse<Product>>(`/products/${id}`);

// ====================================================================
// API cho Products (Admin Routes)
// ====================================================================

export const getProducts = (params: { page?: number; search?: string; per_page?: number } = {}) => {
    // Gửi các tham số đến backend
    return axiosInstance.get('/admin/products', { params });
};


export const getProduct = (id: string | number) => axiosInstance.get<ApiResponse<Product>>(`/admin/products/${id}`);

/**
 * TẠO MỚI sản phẩm.
 * Phải nhận vào kiểu 'FormData' để gửi file.
 */
export const createProduct = (data: FormData) => {
    return axiosInstance.post<Product>(`/admin/products`, data);
};

/**
 * CẬP NHẬT sản phẩm.
 * Phải nhận vào kiểu 'FormData' và dùng phương thức 'put' hoặc method spoofing.
 */
export const updateProduct = (id: string | number, data: FormData) => {
    // Method spoofing for multipart/form-data with Laravel
    data.append('_method', 'PUT');
    return axiosInstance.post<Product>(`/admin/products/${id}`, data);
};

export const deleteProduct = (id: string | number) => axiosInstance.delete<void>(`/admin/products/${id}`);




export const getColors = () => axiosInstance.get<Color[]>(`/colors`);
export const getColor = (id: string | number) => axiosInstance.get<Color>(`/colors/${id}`);

export const getSizes = () => axiosInstance.get<Size[]>(`/sizes`);
export const getSize = (id: string | number) => axiosInstance.get<Size>(`/sizes/${id}`);

export const getProductVariants = (productId: string | number) => axiosInstance.get<ProductVariant[]>(`/product-variants/${productId}`);
export const getProductVariant = (id: string | number) => axiosInstance.get<ProductVariant>(`/product-variants/${id}`);
export const createProductVariant = (data: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>) => axiosInstance.post<ProductVariant>(`/product-variants`, data);
export const updateProductVariant = (id: string | number, data: Partial<ProductVariant>) => axiosInstance.put<ProductVariant>(`/product-variants/${id}`, data);
export const deleteProductVariant = (id: string | number) => axiosInstance.delete<void>(`/product-variants/${id}`);

// Lấy thống kê chi tiết cho một sản phẩm (admin)
export const getProductStatistics = (
  id: number,
  params?: {
    start_date?: string;
    end_date?: string;
    period?: 'week' | 'month' | 'quarter' | 'custom';
  }
) => {
  return axiosInstance.get(`/admin/products/${id}/statistics`, { params });
};
