export interface Voucher {
  id: number;
  title: string;
  code: string;
  value: number;
  max_value: number;
  quantity: number;
  description: string;
  start_date: string;
  end_date: string;
  status: number;
  discount_amount: number;
  expires_at: string;
  is_active: boolean;
}

export interface VoucherResponse {
  data: Voucher[];
  current_page: number;
  last_page: number;
  total: number;
}
