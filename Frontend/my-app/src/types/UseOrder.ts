export interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface UseOrder {
  id: number;
  status: string;
  total_price: number;
  total: number;
  created_at: string;
  items: OrderItem[];
}
