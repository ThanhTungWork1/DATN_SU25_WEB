// ==========================
// CART TYPES
// ==========================
export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

// ==========================
// PRODUCT TYPES
// ==========================
export interface Variant {
  size?: string;
  stock: number;
  color?: string;
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

// ==========================
// ORDER TYPES
// ==========================
export interface OrderItem {
  id: number;
  order_id?: number | string;
  productId?: number;
  variant_id?: number;
  name?: string;
  price: number;
  quantity: number;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export type Order = {
  id: string | number;
  userId?: number;
  user_id?: number;
  items?: OrderItem[];
  totalAmount?: number;
  total_amount?: number;
  shipping_fee?: number;
  is_paid?: boolean;
  createdAt?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  paymentMethod?: string;
  address?: {
    province: string;
    district: string;
    ward?: string;
    street: string;
  };
};

export interface OrderPayload {
  name: string;
  phone: string;
  address: string;
  items: CartItem[];
  totalAmount: number;
}
