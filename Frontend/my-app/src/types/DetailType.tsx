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
  /** Đây là mục giỏ hàng đã đặt */
  id: number;
  productId: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

export interface Order {
  /** Mã đơn hàng */
  id: number;
  /** Mã người dùng */
  userId: number;
  /** Danh sách sản phẩm đã đặt */
  items: OrderItem[];
  /** Tổng tiền đơn hàng */
  totalAmount: number;
  /** Phí vận chuyển (nếu có) */
  paymentMethod: string;
  /** Địa chỉ giao hàng */
  address: {
    province: string;
    district: string;
    street: string;
  };
  /** Trạng thái đơn */
  status: string;
  /** Ngày tạo đơn */
  createdAt: string;
}

export interface OrderPayload {
  name: string;
  phone: string;
  address: string;
  items: CartItem[];
  totalAmount: number;
}
