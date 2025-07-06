export interface Variant {
  size?: { id: number; name: string; created_at?: string; updated_at?: string };
  stock: number;
  color?: { id: number; name: string; hex_code?: string; created_at?: string; updated_at?: string };
  image?: string;
  sku?: string;
}

export type ColorType = {
  id: number;
  name: string;
  code: string;
  image?: string;
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
  category?: string;
  tags?: string[];
  images?: string[];
  detailImages?: string[];
  variants?: Variant[];
  colors?: ColorType[];
  rating?: number;
  reviews?: number;
  details?: string[];
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