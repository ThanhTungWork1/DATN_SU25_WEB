export type CartItem = {
  id: number;
  product_id: number;
  variant_id?: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
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
  cartItems: CartItem[];
}
