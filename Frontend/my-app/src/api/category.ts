// src/api/category.ts

import axiosInstance from "../utils/axiosInstance";
import { Category } from "../types/ProductType";

// SỬA LẠI: Trỏ đến đúng API endpoint của admin
export const getCategories = () => {
    return axiosInstance.get<Category[]>('/admin/categories');
};


// Lấy chi tiết một danh mục (admin)
export const getCategoryDetail = (id: number) => {
    return axiosInstance.get<Category>(`/admin/categories/${id}`);
};

// Tạo mới một danh mục (admin)
export const createCategory = (data: { name: string; status: boolean }) => {
    return axiosInstance.post<Category>('/admin/categories', data);
};

// Cập nhật một danh mục (admin)
export const updateCategory = (id: number, data: { name: string; status: boolean }) => {
    return axiosInstance.put<Category>(`/admin/categories/${id}`, data);
};

// Xóa một danh mục (admin)
export const deleteCategory = (id: number) => {
    return axiosInstance.delete(`/admin/categories/${id}`);
};
