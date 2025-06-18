import axios from "axios";

export const config = axios.create({
<<<<<<< HEAD
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
=======
  baseURL:"http://localhost:3000"
})
>>>>>>> 01e18de4 ((admin): thêm chức năng hiển thị người dùng , chỉnh sửa người dùng, thêm người dùng, tìm kiếm người dùng)
