export type CartItem = {
  id: number;
  product_id: number;
  variant_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
  sku?: string;
  stock?: number;
};


// ✅ Thêm interface CartResponse
export interface CartResponse {
  id: number;
  user_id: number;
  cart_items: CartItem[]; // SỬA LẠI: cart_items thay vì cartItems
}

export type CartContextType = {
  cartItems: CartItem[];
  fetchCart: () => void;
  addToCart: (item: any) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
};
