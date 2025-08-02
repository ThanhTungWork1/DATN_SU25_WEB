export interface Order {
  id: number;
  order_code: string;
  user_id: number;
  //thêm 3 trường này
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number; // Tổng giá trị sản phẩm
  shipping_fee: number; // Phí vận chuyển
  discount_amount: number; // Số tiền giảm giá
  final_amount: number; // Tổng tiền cuối cùng = total_amount + shipping_fee - discount_amount
  status: 'pending_confirmation' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'completed' | 'cancelled'; // Trạng thái đơn hàng
  payment_method: string;
  is_paid: boolean | number | 'unpaid' | 'paid' | 'refunded' | 'part_paid';
  notes: string | null;
  // Thông tin giao hàng mới
  delivered_at?: string | null;
  shipping_date?: string | null;
  estimated_delivery_date?: string | null;
  tracking_number?: string | null;
  shipping_company?: string | null;
  items?: OrderItem[]; 
  total_quantity?: number; // THÊM MỚI: Để nhận tổng số lượng
  total_items?: number; // THÊM MỚI: Để nhận tổng số sản phẩm
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  variant_id: number | null;
  quantity: number;
  price: number;
  product_name: string;
  variant_color_name: string;
  variant_size_name: string;
  variant_sku: string | null;
  variant_image: string | null;
  variant_image_url?: string; // THÊM MỚI: Để nhận URL ảnh đầy đủ
  created_at: string;
  updated_at: string;
}



export interface Category {
    id: number;
    name: string;
    slug: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

