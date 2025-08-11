// src/api/category.ts

import axiosInstance from "../utils/axiosInstance";
import { Category } from "../types/ProductType";

// SỬA LẠI: Trỏ đến đúng API endpoint của admin
export const getCategories = () => {
    return axiosInstance.get<Category[]>('/categories');
};


// Lấy chi tiết một danh mục (admin)
export const getCategoryDetail = (id: number) => {
    return axiosInstance.get<Category>(`/categories/${id}`);
};

// Tạo mới một danh mục (admin)
export const createCategory = (data: { name: string; status: boolean }) => {
    return axiosInstance.post<Category>('/categories', data);
};

// Cập nhật một danh mục (admin)
export const updateCategory = (id: number, data: { name: string; status: boolean }) => {
    return axiosInstance.put<Category>(`/categories/${id}`, data);
};

// Xóa một danh mục (admin)
export const deleteCategory = (id: number) => {
    return axiosInstance.delete(`/categories/${id}`);
};

// Lấy thống kê chi tiết cho một danh mục (admin)
export const getCategoryDetailStatistics = (
    id: number, 
    params?: {
        start_date?: string;
        end_date?: string;
        period?: 'week' | 'month' | 'quarter' | 'custom';
    }
) => {
    return axiosInstance.get(`/admin/categories/${id}/statistics`, { params });
};
