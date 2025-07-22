// src/utils/axiosInstance.ts

import axios from 'axios';

const API_BASE_URL = "http://localhost:8000/api";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Thêm Interceptor cho Request
axiosInstance.interceptors.request.use(
    config => {
        // Lấy token từ localStorage (hoặc bất kỳ nơi nào bạn lưu token sau khi đăng nhập)
        const token = localStorage.getItem('authToken'); 
        
        if (token) {
            // Thêm token vào header Authorization theo định dạng 'Bearer Token'
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Thêm Interceptor cho Response (để xử lý lỗi 401/403)
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        // Nếu nhận lỗi 401 (Unauthorized) hoặc 403 (Forbidden) từ backend
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.error("Authentication error. Redirecting to login.");
            // Xóa token đã lưu
            localStorage.removeItem('authToken');
            // Redirect về trang đăng nhập
            window.location.href = '/admin/login'; // Chuyển hướng về trang login admin của bạn
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;