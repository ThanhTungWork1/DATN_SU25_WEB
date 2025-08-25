// This section intentionally left blank - content moved to line 211

// // ======================= GET PRODUCT BY ID ========================
// export const getProductById = async (id: string): Promise<Product> => {
//   try {
//     const [
//       productResponse,
//       variantsResponse,
//       colorsResponse,
//       sizesResponse,
//       categoriesResponse,
//     ] = await Promise.all([
//       axios.get(`http://localhost:8000/api/products/${id}`),
//       axios.get(`http://localhost:8000/api/product-variants?product_id=${id}`),
//       axios.get(`http://localhost:8000/api/colors`),
//       axios.get(`http://localhost:8000/api/sizes`),
//       axios.get(`http://localhost:8000/api/categories`),
//     ]);

//     return processProductDetail(
//       productResponse.data.data || productResponse.data,
//       variantsResponse.data.data || variantsResponse.data,
//       colorsResponse.data.data || colorsResponse.data,
//       sizesResponse.data.data || sizesResponse.data,
//       categoriesResponse.data.data || categoriesResponse.data
//     );
//   } catch (error) {
//     console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
//     throw error as any;
//   }
// };

// // ======================= GET ALL PRODUCTS ========================
// export const getAllProducts = async (): Promise<Product[]> => {
//   const { data } = await axios.get(`http://localhost:8000/api/products`);
//   return data.data || (data as Product[]);
// };

// // ======================= GET COMMENTS BY PRODUCT ========================
// export const getProductReviews = async (productId: number) => {
//   return await axios.get(
//     `http://localhost:8000/api/client/comments/product/${productId}`
//   );
// };

// // ======================= SUBMIT REVIEW ========================
// export const submitReview = async (
//   reviewData: {
//     product_id: number;
//     content: string;
//     rating: number;
//   },
//   token: string
// ) => {
//   return await axios.post(
//     `http://localhost:8000/api/client/comments`,
//     reviewData,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
// };

// // ======================= CHECK REVIEW ELIGIBILITY ========================
// export const checkReviewEligibility = async (
//   productId: number,
//   token: string
// ) => {
//   return await axios.get(
//     `http://localhost:8000/api/client/review-eligibility/${productId}`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
// };

// // ======================= GET USERS (phải auth) ========================
// export const getAllUsers = async (token: string) => {
//   return await axios.get(`http://localhost:8000/api/client/users`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// };

// // ======================= CART ========================
// export const getCart = async (token: string) => {
//   const { data } = await axios.get("http://localhost:8000/api/client/cart", {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return data;
// };

// export const addToCart = async (
//   item: {
//     variant_id: number;
//     quantity: number;
//     price: number;
//     color?: string;
//     size?: string;
//   },
//   token: string
// ) => {
//   return await axios.post(
//     "http://localhost:8000/api/client/cart",
//     {
//       cartItems: [
//         {
//           variant_id: item.variant_id,
//           quantity: item.quantity,
//           price: item.price,
//         },
//       ],
//     },
//     {
//       headers: { Authorization: `Bearer ${token}` },
//     }
//   );
// };

// export const updateCartItem = async (
//   id: number,
//   quantity: number,
//   token: string
// ) => {
//   return await axios.patch(
//     `http://localhost:8000/api/client/cart/${id}`,
//     { quantity },
//     {
//       headers: { Authorization: `Bearer ${token}` },
//     }
//   );
// };

// export const removeCartItem = async (id: number, token: string) => {
//   return await axios.delete(`http://localhost:8000/api/client/cart/${id}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
// };

// // ======================= ORDERS (phải auth) ========================
// export const getAllOrders = async (token: string) => {
//   const { data } = await axios.get("http://localhost:8000/api/client/orders", {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return data;
// };

// export const createOrder = async (
//   orderData: {
//     userId: number;
//     items: any[];
//     total: number;
//     address: string;
//     phone: string;
//   },
//   token: string
// ) => {
//   return await axios.post(
//     "http://localhost:8000/api/client/orders",
//     orderData,
//     {
//       headers: { Authorization: `Bearer ${token}` },
//     }
//   );
// };

// export const getOrderById = async (id: number, token: string) => {
//   const { data } = await axios.get(
//     `http://localhost:8000/api/client/orders/${id}`,
//     {
//       headers: { Authorization: `Bearer ${token}` },
//     }
//   );
//   return data;
// };
// // ======================= VNPAY PAYMENT ========================
// export const createVNPayPayment = async (orderId: number, token: string) => {
//   return await axios.post(
//     `http://localhost:8000/api/payments/vnpay/create`,
//     { order_id: orderId },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );
// };
import axios from "axios";
import type { Product } from "../types/DetailType";
import { processProductDetail } from "../utils/productDetailHelper";

// Define response type for API calls
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// ======================= GET PRODUCT BY ID ========================
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const [
      productResponse,
      variantsResponse,
      colorsResponse,
      sizesResponse,
      categoriesResponse,
    ] = await Promise.all([
      axios.get(`http://localhost:8000/api/products/${id}`),
      axios.get(`http://localhost:8000/api/product-variants?product_id=${id}`),
      axios.get(`http://localhost:8000/api/colors`),
      axios.get(`http://localhost:8000/api/sizes`),
      axios.get(`http://localhost:8000/api/categories`),
    ]);

    return processProductDetail(
      (productResponse.data as any).data || productResponse.data,
      (variantsResponse.data as any).data || variantsResponse.data,
      (colorsResponse.data as any).data || colorsResponse.data,
      (sizesResponse.data as any).data || sizesResponse.data,
      (categoriesResponse.data as any).data || categoriesResponse.data
    );
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    throw error as any;
  }
};

// ======================= GET ALL PRODUCTS ========================
export const getAllProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get(`http://localhost:8000/api/products`);
  return (data as any).data || (data as Product[]);
};

// ======================= GET COMMENTS BY PRODUCT ========================
export const getProductReviews = async (productId: number) => {
  return await axios.get(
    `http://localhost:8000/api/client/comments/product/${productId}`
  );
};

// ======================= SUBMIT REVIEW ========================
export const submitReview = async (
  reviewData: {
    product_id: number;
    order_id: number;
    content: string;
    rating: number;
  },
  token: string
) => {
  return await axios.post(`http://localhost:8000/api/comments`, reviewData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// ======================= CHECK REVIEW ELIGIBILITY ========================

// ======================= VNPAY PAYMENT ========================
export const createVNPayPayment = async (orderId: number, token: string) => {
  return await axios.post(
    `http://localhost:8000/api/payments/vnpay/create`,
    { order_id: orderId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};

// ======================= GET USERS (phải auth) ========================
export const getAllUsers = async (token: string) => {
  return await axios.get(`http://localhost:8000/api/client/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ======================= CART ========================
export const getCart = async (token: string) => {
  const { data } = await axios.get("http://localhost:8000/api/client/cart", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const addToCart = async (
  item: {
    variant_id: number;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
  },
  token: string
) => {
  return await axios.post(
    "http://localhost:8000/api/client/cart",
    {
      cartItems: [
        {
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price,
        },
      ],
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};
export const checkReviewEligibility = async (
  productId: number,
  token: string,
  orderId?: number
) => {
  const url = orderId 
    ? `http://localhost:8000/api/client/review-eligibility/${productId}?order_id=${orderId}`
    : `http://localhost:8000/api/client/review-eligibility/${productId}`;
    
  return await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const updateCartItem = async (
  id: number,
  quantity: number,
  token: string
) => {
  return await axios.patch(
    `http://localhost:8000/api/client/cart/${id}`,
    { quantity },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const removeCartItem = async (id: number, token: string) => {
  return await axios.delete(`http://localhost:8000/api/client/cart/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ======================= ORDERS (phải auth) ========================
export const getAllOrders = async (token: string) => {
  const { data } = await axios.get("http://localhost:8000/api/client/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createOrder = async (
  orderData: {
    userId: number;
    items: any[];
    total: number;
    address: string;
    phone: string;
  },
  token: string
) => {
  return await axios.post(
    "http://localhost:8000/api/client/orders",
    orderData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

export const getOrderById = async (id: number, token: string) => {
  const { data } = await axios.get(
    `http://localhost:8000/api/client/orders/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};

// Helper function to get CSRF token from cookies with better error handling
const getCsrfToken = (): string => {
  try {
    // Try to get from cookies first
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    // Try XSRF-TOKEN first (Laravel default)
    if (cookies['XSRF-TOKEN']) {
      return decodeURIComponent(cookies['XSRF-TOKEN']);
    }
    
    // Try lowercase version
    if (cookies['xsrf-token']) {
      return cookies['xsrf-token'];
    }
    
    // Try to find in the entire cookie string as fallback
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    
    console.error('CSRF token not found in cookies. Available cookies:', document.cookie);
    throw new Error('CSRF token not found in cookies');
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    throw error;
  }
};

export const forgotPasswordApi = async (email: string) => {
  try {
    // First, ensure we have a session
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true
    });

    // Then make the forgot password request
    const response = await axios.post(
      "http://localhost:8000/api/forgot-password",
      { email },
      {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Forgot password error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

/**
 * Đặt lại mật khẩu bằng token
 */
export const resetPasswordApi = async (
  data: ResetPasswordRequest
): Promise<ApiResponse> => {
  try {
    // First, get CSRF cookie
    await fetch('http://localhost:8000/sanctum/csrf-cookie', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    // Get CSRF token from cookies
    const csrfToken = getCsrfToken();
    
    if (!csrfToken) {
      throw new Error('Failed to retrieve CSRF token');
    }

    const response = await fetch("http://localhost:8000/api/reset-password", {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-XSRF-TOKEN": csrfToken
      },
      body: JSON.stringify({
        email: data.email,
        token: data.token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || "Failed to reset password");
    }

    return responseData;
  } catch (error: any) {
    console.error("Reset password error:", error);
    throw error;
  }
};