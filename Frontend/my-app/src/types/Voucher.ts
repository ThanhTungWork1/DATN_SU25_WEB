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
  status: boolean;
}

