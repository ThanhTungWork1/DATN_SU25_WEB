import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Interceptor cho Request
axiosInstance.interceptors.request.use(
  (config) => {
    // Đảm bảo headers tồn tại để tránh lỗi typescript
    if (!config.headers) {
      config.headers = {};
    }

    config.headers["Accept"] = "application/json";

    // Lấy token dựa trên vai trò hiện tại để tránh xung đột
    const role = localStorage.getItem("role");
    let token = null;

    if (role === "1" || role === "2") {
      // Admin hoặc vai trò tương tự
      token = localStorage.getItem("admin_token");
    } else {
      // Mặc định là người dùng
      token = localStorage.getItem("user_token");
    }

    // 🔍 DEBUG: Log token info
    console.log("🔍 axiosInstance - Request debug:", {
      url: config.url,
      role,
      admin_token: localStorage.getItem("admin_token") ? "Có" : "Không",
      user_token: localStorage.getItem("user_token") ? "Có" : "Không",
      selected_token: token ? "Có" : "Không",
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response (xử lý lỗi 401/403)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // 🔧 FIX: Không xử lý lỗi 401/403 cho login request
      const isLoginRequest = error.config?.url?.includes("/login");

      if (isLoginRequest) {
        console.log("🔐 Login request failed - letting it handle normally");
        return Promise.reject(error);
      }

      console.error(
        "❌ Token không hợp lệ hoặc đã hết hạn. Đang chuyển hướng..."
      );

      const role = localStorage.getItem("role");

      // Xử lý riêng theo từng vai trò
      if (role === "1" || role === "2") {
        // 👉 Admin hoặc moderator
        localStorage.removeItem("admin_token");
        window.location.href = "/login";
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
