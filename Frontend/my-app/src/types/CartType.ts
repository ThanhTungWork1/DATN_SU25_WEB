// Định nghĩa cấu trúc chi tiết cho các thành phần
interface Color {
  id: number;
  name: string;
  hex_code: string;
}

interface Size {
  id: number;
  name: string;
}

interface ProductInfo {
  id: number;
  name: string;
  image_url?: string;
}

interface ProductVariant {
  id: number;
  image_url?: string; // Thêm URL ảnh cho biến thể
  color: Color;
  size: Size;
  product?: ProductInfo;
}

// Cập nhật CartItem để sử dụng cấu trúc lồng nhau
export type CartItem = {
  id: number;
  product_variant_id: number;
  quantity: number;
  price: number;
  // Các thuộc tính dưới đây có thể không cần thiết nếu đã có product_variant
  // nhưng giữ lại để tương thích với các logic hiện có
  name: string;
  image?: string;
  // Thêm đối tượng product_variant
  product_variant?: ProductVariant;
};

export interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
}

// ✅ Thêm interface CartResponse
export interface CartResponse {
  id: number;
  user_id: number;
  cart_items: CartItem[];
}

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant_id?: number;
}

export interface Address {
  street: string;
  ward: string;
  district: string;
  province: string;
}
