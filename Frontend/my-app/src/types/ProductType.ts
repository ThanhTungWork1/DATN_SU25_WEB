export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  old_price: number | null; 
  status: boolean | number;
  slug: string; 
  category_id: number; 
  image: string;
  hover_image: string | null;
  material: string | string[] | null;
  sold: number;
  image_url?: string;
  hover_image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Color {
  id: number;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface Size {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

// SỬA LẠI: Cập nhật interface này để khớp với database và form
export interface ProductVariant {
  id: number;
  product_id: number;
  color_id: number;
  size_id: number;
  stock: number; // Đổi từ stock_quantity thành stock
  price: number; // Thêm trường price
  image: string | null;
  sku: string | null; // Sửa lại cho khớp
  created_at: string;
  updated_at: string;
}

export interface Category {
    id: number;
    name: string;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
}
