import { UseOrder, OrderItem } from '../types/UseOrder';

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
  shipping_fee: number | string;
  shipping_address: string;
  shipping_phone: string;
  shipping_name: string;
  note: string;
  created_at: string;
  updated_at: string;
  items: BackendOrderItem[];
}

export const transformOrder = (backendOrder: BackendOrder): UseOrder => {
  const transformedItems: OrderItem[] = backendOrder.items.map(item => {
    const price = safeNumber((item as any).price);
    const quantity = safeNumber(item.quantity);
    return {
      id: item.id,
      variant_id: item.variant_id,
      product_id: item.variant.product.id,
      product_name: `${item.variant.product.name} (${item.variant.color.name}, ${item.variant.size.name})`,
      product_image: (item as any).variant?.product?.image,
      quantity,
      price,
      total: price * quantity,
    };
  });

  const totalAmount = safeNumber((backendOrder as any).total_amount);
  const shippingFee = safeNumber((backendOrder as any).shipping_fee);

  return {
    id: backendOrder.id,
    status: backendOrder.status,
    total_price: totalAmount + shippingFee,
    total: totalAmount,
    created_at: backendOrder.created_at,
    updated_at: backendOrder.updated_at,
    items: transformedItems,
    shipping_address: backendOrder.shipping_address,
    payment_method: 'Thanh toán khi nhận hàng', // Default value
    note: backendOrder.note,
    is_paid: backendOrder.is_paid, // Thêm trường is_paid
  };
};

export const transformOrders = (backendOrders: BackendOrder[]): UseOrder[] => {
  return backendOrders.map(transformOrder);
};