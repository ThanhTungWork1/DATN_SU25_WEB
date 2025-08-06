import { UseOrder, OrderItem } from '../types/UseOrder';

interface BackendOrderItem {
  id: number;
  variant_id: number;
  quantity: number;
  price: number;
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
  total_amount: number;
  shipping_fee: number;
  shipping_address: string;
  shipping_phone: string;
  shipping_name: string;
  note: string;
  created_at: string;
  updated_at: string;
  items: BackendOrderItem[];
}

export const transformOrder = (backendOrder: BackendOrder): UseOrder => {
  const transformedItems: OrderItem[] = backendOrder.items.map(item => ({
    id: item.id,
    product_id: item.variant.product.id,
    product_name: `${item.variant.product.name} (${item.variant.color.name}, ${item.variant.size.name})`,
    product_image: item.variant.product.image,
    quantity: item.quantity,
    price: item.price,
    total: item.price * item.quantity
  }));

  return {
    id: backendOrder.id,
    status: backendOrder.status,
    total_price: backendOrder.total_amount + backendOrder.shipping_fee,
    total: backendOrder.total_amount,
    created_at: backendOrder.created_at,
    updated_at: backendOrder.updated_at,
    items: transformedItems,
    shipping_address: backendOrder.shipping_address,
    payment_method: 'Thanh toán khi nhận hàng', // Default value
    note: backendOrder.note
  };
};

export const transformOrders = (backendOrders: BackendOrder[]): UseOrder[] => {
  return backendOrders.map(transformOrder);
}; 