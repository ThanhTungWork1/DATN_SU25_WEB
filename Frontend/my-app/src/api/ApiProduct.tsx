import axios from "axios";
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
  search?: string,
): Promise<ProductPaginatedResponse> => {
  // TODO: Đổi URL này thành API thật của bạn khi backend sẵn sàng
  const params: any = { _page: page, _limit: limit };
  if (search) params.q = search;
  const { data, headers } = await axios.get("http://localhost:3000/products", {
    params,
  });
  const total = parseInt(headers["x-total-count"] || "0");
  return {
    products: data as Product[],
    total,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Lấy toàn bộ danh mục
 */
export const getAllCategories = async () => {
  const { data } = await axios.get("http://localhost:3000/categories");
  return data as { id: number; name: string }[];
};

/**
 * Lấy toàn bộ sản phẩm (không phân trang)
 */
export const getAllProducts = async () => {
  const { data } = await axios.get("http://localhost:3000/products");
  return data as Product[];
};

/**
 * Lấy toàn bộ màu sắc
 */
export const getAllColors = async () => {
  const { data } = await axios.get("http://localhost:3000/colors");
  return data as { id: number; name: string; code: string }[];
};

/**
 * Lấy toàn bộ kích cỡ
 */
export const getAllSizes = async () => {
  const { data } = await axios.get("http://localhost:3000/sizes");
  return data as { id: number; name: string }[];
};
