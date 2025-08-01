import { config } from "./axios";
import type { Product } from "../types/ProductType";
import type { ProductPaginatedResponse } from "../types/ProductType";

/**
 * Lấy danh sách sản phẩm có phân trang
 * @param page Trang hiện tại (bắt đầu từ 1)
 * @param limit Số sản phẩm mỗi trang
 * @param search Từ khóa tìm kiếm (tùy chọn)
 * @returns Danh sách sản phẩm, tổng số sản phẩm, tổng số trang
 */
export const getProductsPaginated = async (
  page: number,
  limit: number,
  search?: string
): Promise<ProductPaginatedResponse> => {
  const params: any = { page, limit };
  if (search) params.search = search;
  const { data } = await config.get("/product", { params });
  return data as ProductPaginatedResponse;
};

/**
 * Lấy toàn bộ danh mục
 */
export const getAllCategories = async () => {
  const { data } = await config.get("/categories");
  const res: any = data;
  if (Array.isArray(res)) return res as { id: number; name: string }[];
  if (Array.isArray(res.data))
    return res.data as { id: number; name: string }[];
  return [];
};

/**
 * Lấy toàn bộ sản phẩm (không phân trang)
 */
export const getAllProducts = async () => {
  console.log('🔍 [getAllProducts DEBUG] Starting API call...');
  
  // Gọi API trực tiếp không có tham số
  const { data } = await config.get("/product");
  
  console.log('🔍 [getAllProducts DEBUG] Raw API response:', data);
  
  // Nếu trả về dữ liệu phân trang, lấy mảng data
  if (data && data.data && Array.isArray(data.data)) {
    console.log('🔍 [getAllProducts DEBUG] Returning paginated data.data:', data.data);
    return data.data as Product[];
  }
  
  // Nếu trả về mảng trực tiếp
  if (Array.isArray(data)) {
    console.log('🔍 [getAllProducts DEBUG] Returning direct array:', data);
    return data as Product[];
  }
  
  console.log('🔍 [getAllProducts DEBUG] Returning empty array');
  return [] as Product[];
};

/**
 * Lấy toàn bộ màu sắc
 */
export const getAllColors = async () => {
  const response = await config.get("/colors");
  const data = response.data as {
    data: { id: number; name: string; code: string }[];
  };
  return data.data;
};

/**
 * Lấy toàn bộ kích cỡ size
 */
export const getAllSizes = async () => {
  const response = await config.get("/sizes");
  const data = response.data as { data: { id: number; name: string }[] };
  return data.data;
};

/**
 * Lấy sản phẩm có phân trang và filter từ backend
 */
export const getProductsPaginatedAndFiltered = async (params: any) => {
  const response = await config.get("/product/search", { params });
  return response.data;
};

/**
 * Lấy chi tiết sản phẩm từ backend
 */
export const getProductDetail = async (id: string | number) => {
  const response = await config.get(`/product/${id}`);
  return response.data;
};
2;
