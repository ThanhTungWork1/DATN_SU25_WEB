export interface OrderItem {
  id: number;
  variant_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  total: number;
}

import { RefundRequest } from './Order';

export interface UseOrder {
  id: number;
  status: string;
  total_price: number;
  total: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  refund_request?: RefundRequest | null;
  shipping_address?: string;
  payment_method?: string;
  note?: string;
  // Các trường bổ sung theo API thực tế
  total_amount?: number | string; // ví dụ: "198.00"
  shipping_fee?: number | string; // ví dụ: "35.00"
  discount_amount?: number | string; // ví dụ: "10.00"
  is_paid: boolean | number;
}
