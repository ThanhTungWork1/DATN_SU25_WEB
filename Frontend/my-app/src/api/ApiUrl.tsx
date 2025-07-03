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
      axios.get(`http://localhost:3000/products/${id}`),
      axios.get(`http://localhost:3000/productVariants?product_id=${id}`),
      axios.get(`http://localhost:3000/colors`),
      axios.get(`http://localhost:3000/sizes`),
      axios.get(`http://localhost:3000/categories`),
    ]);

    return processProductDetail(
      productResponse.data,
      variantsResponse.data,
      colorsResponse.data,
      sizesResponse.data,
      categoriesResponse.data
    );
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    throw error;
  }
};

// ======================= GET ALL PRODUCTS ========================
export const getAllProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get(`http://localhost:3000/products`);
  return data;
};

// ======================= GET COMMENTS BY PRODUCT ========================
export const getProductReviews = async (productId: number) => {
  return await axios.get(`http://localhost:3000/comments?product_id=${productId}`);
};

// ======================= GET USERS ========================
export const getAllUsers = async () => {
  return await axios.get(`http://localhost:3000/users`);
};

// ======================= CART ========================
export const getCart = async () => {
  const { data } = await axios.get("http://localhost:3000/cart");
  return data;
};

export const addToCart = async (item: {
  productId: number;
  quantity: number;
  color?: string;
  size?: string;
}) => {
  return await axios.post("http://localhost:3000/cart", item);
};

export const updateCartItem = async (id: number, quantity: number) => {
  return await axios.patch(`http://localhost:3000/cart/${id}`, { quantity });
};

export const removeCartItem = async (id: number) => {
  return await axios.delete(`http://localhost:3000/cart/${id}`);
};

// ======================= ORDERS ========================
export const getAllOrders = async () => {
  const { data } = await axios.get("http://localhost:3000/orders");
  return data;
};

export const createOrder = async (orderData: {
  userId: number;
  items: any[];
  total: number;
  address: string;
  phone: string;
}) => {
  return await axios.post("http://localhost:3000/orders", orderData);
};

export const getOrderById = async (id: number) => {
  const { data } = await axios.get(`http://localhost:3000/orders/${id}`);
  return data;
};
