import axios from "axios";
import type { Product } from "../types/DetailType";
import { processProductDetail } from "../utils/productDetailHelper";
/*
 * =================================================================
 * HÀM LẤY DỮ LIỆU CHI TIẾT SẢN PHẨM (getProductById)
 * =================================================================
 * Mục tiêu: Lấy đầy đủ thông tin cho một sản phẩm, bao gồm cả các
 * biến thể (variants), màu sắc (colors), và kích cỡ (sizes) của nó.
 */
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
    console.error("Lỗi nghiêm trọng khi lấy dữ liệu chi tiết sản phẩm:", error);
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
  // Trả về promise dữ liệu comments cho sản phẩm
  return await axios.get(
    `http://localhost:3000/comments?product_id=${productId}`,
  );
};
/*
 * =================================================================
 * HÀM LẤY DANH SÁCH USER
 * =================================================================
 * Mục tiêu: Lấy tất cả user để join vào đánh giá
 */
export const getAllUsers = async () => {
  // Trả về promise dữ liệu user
  return await axios.get(`http://localhost:3000/users`);
};
