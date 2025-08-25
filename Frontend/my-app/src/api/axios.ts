import axios from 'axios';

// Helper function to get cookie value
const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

// Create base axios instance with default config
const createAxiosClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  // Add request interceptor to handle CSRF token
  client.interceptors.request.use(
    (config) => {
      // Skip CSRF token for GET requests and CSRF cookie endpoint
      if (config.method?.toLowerCase() === 'get' || config.url?.includes('sanctum/csrf-cookie')) {
        return config;
      }

      // Get XSRF token from cookies
      const xsrfToken = getCookie('XSRF-TOKEN');
      
      // If we have a token, add it to the headers
      if (xsrfToken && config.headers) {
        config.headers['X-XSRF-TOKEN'] = xsrfToken;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return client;
};

// Create axios instances
export const config = createAxiosClient('http://localhost:8000/api');
export const publicAxios = createAxiosClient('http://localhost:8000');

// Function to ensure CSRF token is set before making requests
export const ensureCsrfToken = async (): Promise<void> => {
  try {
    await publicAxios.get('/sanctum/csrf-cookie');
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
};

// Fetch CSRF token when the app loads
ensureCsrfToken();

import { TokenManager } from "../utils/tokenUtils";

// Thêm interceptor để tự động gửi token cho mọi request
config.interceptors.request.use(
  (request) => {
    // SỬA: Sử dụng TokenManager để lấy token đồng bộ
    const token = TokenManager.getToken();
    if (token) {
      request.headers = request.headers || {};
      request.headers["Authorization"] = `Bearer ${token}`;
    }
    return request;
  },
  (error) => Promise.reject(error)
);
