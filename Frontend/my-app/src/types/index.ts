export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface OrderPayload {
  name: string;
  phone: string;
  address: string;
  items: CartItem[];
  totalAmount: number;
}
