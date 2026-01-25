import type { ColorType } from "./ColorType";

export interface User {
  id: number;
  name: string;
  avatar?: string;
}

export interface Comment {
  id: number;
  user: User;
  content: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface Variant {
  id: number; // Thêm ID cho biến thể
  size?: { id: number; name: string; created_at?: string; updated_at?: string };
  stock: number;
  color?: {
    id: number;
    name: string;
    hex_code?: string;
    created_at?: string;
    updated_at?: string;
  };
  image?: string;
  image_url?: string; // ✅ Thêm image_url cho variant
  price?: number; // ✅ Thêm price cho variant
  sku?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  final_price?: number;
  original_price?: number;
  old_price?: number;
  description?: string;
  status?: boolean;
  slug?: string;
  category_id?: number;
  image?: string;
  image_url?: string; // ✅ Thêm image_url từ backend
  hover_image?: string; // ✅ Thêm hover_image từ DB
  hover_image_url?: string; // ✅ Thêm hover_image_url từ backend
  material?: string;
  sold?: number;
  discount?: number;
  sku?: string;
  category?: { id: number; name: string };
  tags?: string[];
  images?: { id: number; image_url: string; public_id?: string }[];
  detailImages?: string[];
  variants?: Variant[];
  colors?: ColorType[];
  rating?: number;
  reviews?: number;
  details?: string[];
  comments?: Comment[];
  average_rating?: number;
  created_at?: string;
  updated_at?: string;
}

export type SizeProps = {
  variants: Variant[];
  selectedSize: string | null;
  onSelectSize: (size: string) => void;
};

export interface Order {
  id: number;
  createdAt?: string;
  created_at?: string;
  status: string;
  paymentMethod?: string;
  totalAmount?: number;
  total_amount?: number;
  address?: {
    street?: string;
    ward?: string;
    district?: string;
    province?: string;
  };
  items?: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
  // Thêm các trường khác nếu cần
}
