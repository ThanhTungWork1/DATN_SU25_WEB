export interface Variant {
  size?: {
    id: number;
    name: string;
    created_at?: string;
    updated_at?: string;
  };
  stock: number;
  color?: {
    id: number;
    name: string;
    hex_code?: string;
    created_at?: string;
    updated_at?: string;
  };
  image?: string;
  sku?: string;
}

export type ColorType = {
  id: number;
  name: string;
  code: string;       // Đây là `hex_code` rút gọn lại
  image?: string;     // Gắn vào từ `variant.image`
};

export interface Product {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  old_price?: number;
  description?: string;
  status?: boolean;
  slug?: string;
  category_id?: number;
  image?: string;
  material?: string;
  sold?: number;
  discount?: number;
  sku?: string;

  // ✅ Các trường được thêm khi xử lý chi tiết
  category?: string;            // tên danh mục dạng text
  variants?: {
    size?: string;              // lấy từ size.name
    stock: number;
    color?: string;             // lấy từ color.name
    image?: string;
    sku?: string;
  }[];
  colors?: ColorType[];         // màu sắc riêng biệt của sản phẩm

  // ✅ Các trường bổ sung cho frontend (nếu có)
  tags?: string[];
  images?: string[];
  detailImages?: string[];
  rating?: number;
  reviews?: number;
  details?: string[];
}
