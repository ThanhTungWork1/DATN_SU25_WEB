import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
});

axiosInstance.interceptors.request.use((request) => {
  const token = localStorage.getItem("token");
  if (token) {
    request.headers = request.headers || {};
    request.headers["Authorization"] = `Bearer ${token}`;
  }
  return request;
});

export default axiosInstance;
