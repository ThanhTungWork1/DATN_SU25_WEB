export interface OrderItem {
  id: number;
  order_id: number;
  variant_id: number;
  quantity: number;
  price: number;
  product_name: string;
  variant_color_name: string;
  variant_size_name: string;
  variant_sku: string;
  variant_image: string;
  variant_image_url?: string;
  subtotal: number;
  created_at: string;
  updated_at: string;
}

export interface UseOrder {
  id: number;
  user_id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  is_paid: boolean;
  total_amount: number;
  shipping_fee: number;
  discount_amount: number;
  final_amount?: number;
  shipping_address: string;
  shipping_phone: string;
  shipping_name: string;
  note?: string;
  payment_method?: string;
  total_quantity: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}
