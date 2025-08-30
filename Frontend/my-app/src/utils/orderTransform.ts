import { UseOrder, OrderItem } from "../types/UseOrder";

// Ép kiểu an toàn sang số từ giá trị API (có thể là string như "99.00")
const safeNumber = (v: unknown): number => {
  const n = Number(v);
  return isFinite(n) ? n : 0;
};

interface BackendOrderItem {
  id: number;
  variant_id: number;
  quantity: number;
  price: number | string;
  image_url?: string; // Thêm field image_url từ API
  variant: {
    product: {
      id: number;
      name: string;
      image: string;
    };
    color: {
      name: string;
    };
    size: {
      name: string;
    };
  };
}

interface BackendOrder {
  id: number;
  status: string;
  is_paid: any; // Thêm trường is_paid
  total_amount: number | string;
  final_amount: number | string; // Thêm trường final_amount
  shipping_fee: number | string;
  shipping_address: string;
  shipping_phone: string;
  shipping_name: string;
  note: string;
  created_at: string;
  updated_at: string;
  items: BackendOrderItem[];
  refund_request?: {
    id: number;
    order_id: number;
    user_id: number;
    amount: string;
    reason: string;
    bank_account_name: string;
    bank_account_number: string;
    bank_name: string;
    evidence_image?: string;
    status: string;
    note_admin?: string;
    transaction_code?: string;
    created_at: string;
    updated_at: string;
  };
}

export const transformOrder = (backendOrder: BackendOrder): UseOrder => {
  const transformedItems: OrderItem[] = backendOrder.items.map((item) => {
    const price = safeNumber((item as any).price);
    const quantity = safeNumber(item.quantity);

    // 🔍 DEBUG: Log để kiểm tra image_url cho tất cả items
    console.log("🔍 TRANSFORM ITEM:", {
      order_id: backendOrder.id,
      item_id: item.id,
      variant_id: item.variant_id,
      image_url: (item as any).image_url,
      variant_image_url: (item as any).variant_image_url,
      variant_image_url_accessor: (item as any).variant?.image_url,
      product_image_url: (item as any).variant?.product?.image_url,
      product_image: (item as any).variant?.product?.image,
      final_image:
        (item as any).image_url ||
        (item as any).variant_image_url ||
        (item as any).variant?.image_url ||
        (item as any).variant?.product?.image_url ||
        (item as any).variant?.product?.image,
    });

    return {
      id: item.id,
      variant_id: item.variant_id,
      product_id: item.variant.product.id,
      product_name: `${item.variant.product.name} (${item.variant.color.name}, ${item.variant.size.name})`,
      product_image:
        // Ưu tiên ảnh mới nhất từ sản phẩm hiện tại
        (item as any).variant?.image_url ||
        (item as any).variant?.product?.image_url ||
        (item as any).variant?.product?.image ||
        // Fallback về snapshot nếu không có ảnh mới
        (item as any).image_url ||
        (item as any).variant_image_url,
      quantity,
      price,
      total: price * quantity,
    };
  });

  const totalAmount = safeNumber((backendOrder as any).total_amount);
  const finalAmount = safeNumber((backendOrder as any).final_amount);
  const shippingFee = safeNumber((backendOrder as any).shipping_fee);

  // 🔍 DEBUG: Log để kiểm tra giá trị (only for order 95)
  if (backendOrder.id === 95) {
    console.log("🔍 TRANSFORM ORDER #95:", {
      order_id: backendOrder.id,
      has_refund_request: !!backendOrder.refund_request,
      refund_request_status: backendOrder.refund_request?.status,
      totalAmount_parsed: totalAmount,
      finalAmount_parsed: finalAmount,
    });
  }

  return {
    id: backendOrder.id,
    status: backendOrder.status,
    total_price: finalAmount, // Sử dụng final_amount để hiển thị tổng tiền cuối cùng
    total: totalAmount,
    final_amount: finalAmount, // Thêm field final_amount
    created_at: backendOrder.created_at,
    updated_at: backendOrder.updated_at,
    items: transformedItems,
    shipping_address: backendOrder.shipping_address,
    payment_method: "Thanh toán khi nhận hàng", // Default value
    note: backendOrder.note,
    is_paid: backendOrder.is_paid, // Thêm trường is_paid
    refund_request: backendOrder.refund_request
      ? {
          id: backendOrder.refund_request.id,
          order_id: backendOrder.refund_request.order_id,
          user_id: backendOrder.refund_request.user_id,
          amount: safeNumber(backendOrder.refund_request.amount), // Convert string to number
          reason: backendOrder.refund_request.reason,
          status: backendOrder.refund_request.status as
            | "pending"
            | "approved"
            | "rejected", // Type assertion
          bank_account_name: backendOrder.refund_request.bank_account_name,
          bank_account_number: backendOrder.refund_request.bank_account_number,
          bank_name: backendOrder.refund_request.bank_name,
          created_at: backendOrder.refund_request.created_at,
          updated_at: backendOrder.refund_request.updated_at,
        }
      : undefined, // Thêm trường refund_request
  };
};

export const transformOrders = (backendOrders: BackendOrder[]): UseOrder[] => {
  return backendOrders.map(transformOrder);
};
