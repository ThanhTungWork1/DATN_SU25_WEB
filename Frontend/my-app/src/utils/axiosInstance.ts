import axios from 'axios';

const API_BASE_URL = "http://127.0.0.1:8000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Interceptor cho Request
axiosInstance.interceptors.request.use(
  config => {
    config.headers['Accept'] = 'application/json';

    // Ưu tiên lấy token theo role
    const adminToken = localStorage.getItem('admin_token');
    const userToken = localStorage.getItem('user_token'); // thống nhất dùng user_token
    const token = adminToken || userToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

    }

    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response (xử lý lỗi 401/403)
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("❌ Token không hợp lệ hoặc đã hết hạn. Đang chuyển hướng...");

      const role = localStorage.getItem("role");

      // Xử lý riêng theo từng vai trò
      if (role === "1" || role === "2") {
        // 👉 Admin hoặc moderator
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
      } else if (role === "0") {
        // 👉 User
        localStorage.removeItem("user_token");
        window.location.href = "/login";
      } else {
        // 👉 Không xác định vai trò → về trang login mặc định
        window.location.href = "/login";
      }

    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
