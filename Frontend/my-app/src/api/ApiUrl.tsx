// import axios from "axios";
// import type { Product } from "../types/DetailType";
// import { processProductDetail } from "../utils/productDetailHelper";

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
