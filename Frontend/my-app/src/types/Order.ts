export interface Order {
  id: number;
  user_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number; // Tổng giá trị sản phẩm
  shipping_fee: number; // Phí vận chuyển
  discount_amount: number; // Số tiền giảm giá
  final_amount: number; // Tổng tiền cuối cùng = total_amount + shipping_fee - discount_amount
  status: 'pending_confirmation' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled'; // Trạng thái đơn hàng
  payment_method: string;
  payment_status: 'unpaid' | 'paid' | 'refunded' | 'part_paid';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  variant_id: number;
  product_id: number;
  product_name: string;
  color_name: string; // Tên màu sắc của sản phẩm tại thời điểm đặt hàng
  size_name: string; // Tên kích thước của sản phẩm tại thời điểm đặt hàng
  quantity: number; // Số lượng sản phẩm  trong đơn hàng
  price_at_order: number; // Giá sản phẩm tại thời điểm đặt hàng
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

