export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  old_price: number | null; // Có thể null nếu không có giá cũ
  status: 'active' | 'out_of_stock' | 'inactive'; // Trạng thái sản phẩm
  slug: string;
  category_id: number; // ID của danh mục
  colors: number[]; // Mảng các ID màu sắc
  sizes: number[]; // Mảng các ID kích thước
  main_image: string; // URL ảnh chính
  images: string[]; // Mảng các URL ảnh phụ
  materials: string[]; // Mảng các chất liệu
  sold_count: number; // Số lượng đã bán
  created_at: string;
  updated_at: string;
}

export interface Color {
  id: number;
  name: string;
  code: string; // Mã màu 
  created_at: string;
  updated_at: string;
}

export interface Size {
  id: number;
  name: string; // Ví dụ: "S", "M", "L", "XL"
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  color_id: number;
  size_id: number;
  stock_quantity: number; // Số lượng tồn kho 
  image: string | null; // Ảnh riêng cho biến thể 
  sku: string; // Mã SKU cho biến thể
  created_at: string;
  updated_at: string;
}