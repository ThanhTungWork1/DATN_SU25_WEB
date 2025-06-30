import axios from "axios";
import type { Product } from "../types/DetailType";
import { processProductDetail } from "../utils/productDetailHelper";
/*
 * =================================================================
 * HÀM LẤY DỮ LIỆU CHI TIẾT SẢN PHẨM (getProductById)
 * ============================================================ */
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

    const productData = productResponse.data as Product;
    const variantsFromDb = variantsResponse.data as any[];
    const allColors = colorsResponse.data as any[];
    const allSizes = sizesResponse.data as any[];
    const allCategories = categoriesResponse.data as any[];

    // Sử dụng helper để xử lý dữ liệu
    return processProductDetail(
      productData,
      variantsFromDb,
      allColors,
      allSizes,
      allCategories,
    );
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    throw error;
  }
};
// Lấy hết sản phẩm
export const getAllProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get(`http://localhost:3000/products`);
  return data as Product[];
};
/*
 * =================================================================
 * HÀM LẤY DANH SÁCH ĐÁNH GIÁ (COMMENTS) CHO SẢN PHẨM
 * =================================================================
 * Mục tiêu: Lấy tất cả đánh giá (comments) của một sản phẩm theo product_id
 */
export const getProductReviews = async (productId: number) => {
  return await axios.get(`http://localhost:3000/comments?product_id=${productId}`);
};
/*
 * =================================================================
 * HÀM LẤY DANH SÁCH USER
 * =================================================================
 * Mục tiêu: Lấy tất cả user để join vào đánh giá
 */
export const getAllUsers = async () => {
  return await axios.get(`http://localhost:3000/users`);
};

/* ============================================================
 * GIỎ HÀNG - CART
 * ============================================================ */
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

/* ============================================================
 * ĐƠN HÀNG - ORDER
 * ============================================================ */
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
