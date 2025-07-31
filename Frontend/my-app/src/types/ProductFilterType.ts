export interface ProductFilter {
  name?: string; // Tên sản phẩm (tìm kiếm)
  priceRange?: string; // Giá tiền ("9-99", "99-499", ...)
  colors?: number[]; // ID màu (liên kết với bảng colors)
  sizes?: number[]; // ID size (liên kết với bảng sizes)
  materials?: string[]; // Chất liệu ("Cotton", ...)
  categories?: number[]; // ID danh mục (liên kết với bảng categories)
  type?: string; // Loại sản phẩm ("ao", "quan")
}
