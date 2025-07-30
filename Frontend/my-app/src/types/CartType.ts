export type CartItem = {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};


// ✅ Thêm interface CartResponse
export interface CartResponse {
  id: number;
  user_id: number;
  cartItems: CartItem[];
}
