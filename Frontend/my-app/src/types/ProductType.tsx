export interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  sold?: number;
  discount?: number;
  old_price?: number;
  category_id?: number; // id danh mục
  categoryName?: string; // tên danh mục đã map
  colors?: number[]; // Mảng id màu (liên kết với bảng colors)
  sizes?: number[]; // Mảng id size (liên kết với bảng sizes)
  materials?: string[]; // Chất liệu (vẫn là string)
  images?: string[]; // Mảng ảnh sản phẩm (dùng cho hover)
  type?: string; // Loại sản phẩm ("ao", "quan") nếu có
}

export type ProductPaginatedResponse = {
  products: Product[];
  total: number;
  totalPages: number;
};
