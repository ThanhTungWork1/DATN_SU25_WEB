import axios from 'axios';
import { TokenManager } from '../utils/tokenUtils';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true, // Quan trọng cho việc xác thực qua cookie của Sanctum
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Thêm interceptor để tự động đính kèm token vào mỗi request
axiosInstance.interceptors.request.use(
    (config) => {
                const token = TokenManager.getToken();
        if (token) {
            if (!config.headers) {
                config.headers = {};
            }
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
