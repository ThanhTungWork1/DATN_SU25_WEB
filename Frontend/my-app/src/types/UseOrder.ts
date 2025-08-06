export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  total: number;
}

export interface UseOrder {
  id: number;
  status: string;
  total_price: number;
  total: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  shipping_address?: string;
  payment_method?: string;
  note?: string;
}
