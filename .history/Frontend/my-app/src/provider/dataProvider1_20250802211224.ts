import axios from "axios";

type getListType = {
  resource: string;
  params?: any;
};
type getOneType = {
  resource: string;
  id: number;
};
type createType = {
  resource: string;
  variables: any;
};
type updateType = {
  resource: string;
  variables: any;
  id: number;
};

// Tạo axios instance với baseURL đúng
const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Thêm interceptor để tự động gửi token
axiosInstance.interceptors.request.use(
  (request) => {
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

const dataProvider = {
  getList: async ({ resource, params }: getListType) => {
    // Sử dụng route admin cho tất cả resources
    const endpoint = `/admin/${resource}`;

    // Debug authentication
    const token =
      localStorage.getItem("admin_token") || localStorage.getItem("user_token");

    const response = await axiosInstance.get(endpoint, { params });

    // Handle different response formats
    let data;
    if (response.data && response.data.data) {
      // Format: { success: true, data: [...], pagination: {...} }
      data = response.data.data;
    } else if (Array.isArray(response.data)) {
      // Format: [...] (direct array)
      data = response.data;
    } else {
      // Fallback
      data = response.data || [];
    }

    return {
      data: data,
    };
  },
  getOne: async ({ resource, id }: getOneType) => {
    // Sử dụng route admin cho tất cả resources
    const endpoint = `/admin/${resource}/${id}`;
    const response = await axiosInstance.get(endpoint);
    return {
      data: response.data,
    };
  },
  createOne: async ({ resource, variables }: createType) => {
    // Sử dụng route admin cho tất cả resources
    const endpoint = `/admin/${resource}`;

    const response = await axiosInstance.post(endpoint, variables);
    return {
      data: response.data,
    };
  },
  updateOne: async ({ resource, id, variables }: updateType) => {
    // Sử dụng route admin cho tất cả resources
    const endpoint = `/admin/${resource}/${id}`;
    const response = await axiosInstance.put(endpoint, variables);
    return {
      data: response.data,
    };
  },
  getUpdateProfile: async ({
    resource,
    id,
    variable,
  }: {
    resource: string;
    id: number;
    variable: any;
  }) => {
    const response = await axiosInstance.put(`/${resource}/${id}`, variable);
    return {
      data: response.data,
    };
  },
};

export const { getList, createOne, updateOne, getOne, getUpdateProfile } =
  dataProvider;
