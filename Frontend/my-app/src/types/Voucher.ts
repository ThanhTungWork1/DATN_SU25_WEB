export interface Voucher {
  id: number;
  title: string;
  code: string;
  value?: number;
  discount_amount?: number;
  max_value: number;
  quantity: number;
  description: string;
  start_date: string;
  end_date?: string;
  expiry_date?: string;
  status: boolean;
  min_order_amount: number;
  max_usage: number;
  used_count: number;
  discount_type: "fixed" | "percent" | "percentage" | "amount";
  created_at: string;
  updated_at: string;
  max_discount_amount?: number;

  // Computed properties from backend
  status_label?: string;
  status_color?: string;
  
}

export interface VoucherResponse {
  data: Voucher[];
  current_page: number;
  last_page: number;
  total: number;
}
export type VoucherPayload = {
  code: string;
  discount_amount: number;
  start_date: string;
  end_date: string;
  min_order_amount?: number;
  max_usage: number;
  discount_type: "percentage" | "amount";
  description?: string;
};
