import axios from "axios";

export const config = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Thêm interceptor để tự động gửi token cho mọi request
config.interceptors.request.use(
  (request) => {
    // Ưu tiên lấy admin_token, nếu không có thì lấy user_token
    const token =
      localStorage.getItem("admin_token") || localStorage.getItem("user_token");
    if (token) {
      request.headers = request.headers || {};
      request.headers["Authorization"] = `Bearer ${token}`;
    }
    return request;
  },
  (error) => Promise.reject(error)
);
