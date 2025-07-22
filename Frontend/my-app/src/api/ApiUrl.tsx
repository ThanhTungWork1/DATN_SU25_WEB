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
      productResponse.data,
      variantsResponse.data,
      colorsResponse.data,
      sizesResponse.data,
      categoriesResponse.data
    );
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    throw error as any;
  }
};

// ======================= GET ALL PRODUCTS ========================
export const getAllProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get(`http://localhost:8000/api/products`);
  return data as Product[];
};

// ======================= GET COMMENTS BY PRODUCT ========================
export const getProductReviews = async (productId: number) => {
  return await axios.get(`http://localhost:8000/api/comments/product/${productId}`);
};

// ======================= GET USERS ========================
export const getAllUsers = async () => {
  return await axios.get(`http://localhost:8000/api/users`);
};

// ======================= CART ========================
export const getCart = async () => {
  const { data } = await axios.get("http://localhost:8000/api/cart");
  return data;
};

export const addToCart = async (item: {
  productId: number;
  quantity: number;
  color?: string;
  size?: string;
}) => {
  return await axios.post("http://localhost:8000/api/cart", item);
};

export const updateCartItem = async (id: number, quantity: number) => {
  return await axios.patch(`http://localhost:8000/api/cart/${id}`, { quantity });
};

export const removeCartItem = async (id: number) => {
  return await axios.delete(`http://localhost:8000/api/cart/${id}`);
};

// ======================= ORDERS ========================
export const getAllOrders = async () => {
  const { data } = await axios.get("http://localhost:8000/api/orders");
  return data;
};

export const createOrder = async (orderData: {
  userId: number;
  items: any[];
  total: number;
  address: string;
  phone: string;
}) => {
  return await axios.post("http://localhost:8000/api/orders", orderData);
};

export const getOrderById = async (id: number) => {
  const { data } = await axios.get(`http://localhost:8000/api/orders/${id}`);
  return data;
};