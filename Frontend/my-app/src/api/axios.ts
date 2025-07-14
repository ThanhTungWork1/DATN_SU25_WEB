import axios from "axios";

export const config = axios.create({
  baseURL: "http://localhost:8000/api"
});

// Thêm interceptor để tự động gửi token cho mọi request
config.interceptors.request.use(
  (request) => {
    const token = localStorage.getItem('token');
    if (token) {
      request.headers = request.headers || {};
      request.headers['Authorization'] = `Bearer ${token}`;
    }
    return request;
  },
  (error) => Promise.reject(error)
);