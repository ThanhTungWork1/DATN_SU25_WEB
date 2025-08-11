import axios from "axios";

const publicAxios = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Tự động gắn Authorization từ localStorage nếu có
publicAxios.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("user_token");
    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      } as any;
    }
  } catch {}
  return config;
});

export default publicAxios;
