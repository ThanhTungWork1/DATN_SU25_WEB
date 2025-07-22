export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  old_price: number | null; 
  status: boolean | number; // Có thể là boolean hoặc 0/1
  slug: string; 
  category_id: number; 
  
  // Tên cột trong DB (mà form sẽ dùng)
  image: string; // Cột 'image' trong DB (ảnh chính)
  hover_image: string | null; // Cột 'hover_image' trong DB (ảnh phụ)
  material: string | string[] | null; // Cột 'material' trong DB, có thể là string hoặc array
  sold: number; // Cột 'sold' trong DB (số lượng đã bán)
  discount: number | null; 
  
  // Tên trường mà API Laravel thực tế đang trả về (nếu dùng API Resource)
  image_url?: string; // API đang trả về tên này cho ảnh chính
  hover_image_url?: string; // API đang trả về tên này cho ảnh phụ

  created_at?: string;
  updated_at?: string;
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

export interface Category {
    id: number;
    name: string;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
}
