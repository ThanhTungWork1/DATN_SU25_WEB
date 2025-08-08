// src/api/comment.ts

import axiosInstance from "../utils/axiosInstance";
import { Comment } from "../types/ProductType";

// Định nghĩa kiểu cho phản hồi phân trang từ Laravel
interface PaginatedResponse<T> {
    data: T[];
    // Thêm các thuộc tính phân trang khác nếu cần
}

// Lấy danh sách tất cả đánh giá (admin)
export const getComments = (page = 1) => {
    return axiosInstance.get<PaginatedResponse<Comment>>(`/admin/comments?page=${page}`);
};

// Cập nhật trạng thái của một đánh giá (admin)
export const updateCommentStatus = (id: number, status: boolean) => {
    return axiosInstance.put(`/admin/comments/${id}/status`, { status });
};

// Xóa một đánh giá (admin)
export const deleteComment = (id: number) => {
    return axiosInstance.delete(`/admin/comments/${id}`);
};
