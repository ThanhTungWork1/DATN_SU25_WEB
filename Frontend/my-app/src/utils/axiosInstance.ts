// src/utils/axiosInstance.ts

import axios from 'axios';

const API_BASE_URL = "http://localhost:8000/api";

// Bỏ phần 'headers' mặc định ở đây để interceptor toàn quyền xử lý
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

// Thêm Interceptor cho Request - Phiên bản hoàn chỉnh và mạnh mẽ hơn
axiosInstance.interceptors.request.use(
    config => {
        // Luôn chấp nhận phản hồi JSON từ server
        config.headers['Accept'] = 'application/json';

        // Lấy token từ localStorage
        const token = localStorage.getItem('authToken'); 
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // QUAN TRỌNG: Logic xử lý Content-Type
        // Nếu dữ liệu là FormData, chúng ta KHÔNG làm gì cả.
        // Axios sẽ tự động đặt Content-Type là 'multipart/form-data' với boundary chính xác.
        if (!(config.data instanceof FormData)) {
            // Nếu không phải FormData, chúng ta mới đặt Content-Type là JSON.
            config.headers['Content-Type'] = 'application/json';
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
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.error("Authentication error. Redirecting to login.");
            localStorage.removeItem('authToken');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
