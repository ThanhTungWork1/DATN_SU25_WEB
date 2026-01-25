import { useQuery } from '@tanstack/react-query';
import { config } from '../api/axios';
import { TokenManager } from '../utils/tokenUtils';

interface OrderReview {
  id: number;
  product_id: number;
  order_id: number;
  content: string;
  rating: number;
  status: number;
  created_at: string;
  user: {
    id: number;
    name?: string;
    username?: string;
  };
  product: {
    id: number;
    name: string;
    image?: string;
  };
}

const fetchOrderReviews = async (orderId: number): Promise<OrderReview[]> => {
  const token = TokenManager.getUserToken();
  if (!token) {
    return [];
  }

  try {
    const response = await config.get(`/client/orders/${orderId}/reviews`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching order reviews:', error);
    return [];
  }
};

export const useOrderReviews = (orderId: number) => {
  const token = TokenManager.getUserToken();
  
  return useQuery({
    queryKey: ['order-reviews', orderId],
    queryFn: () => fetchOrderReviews(orderId),
    enabled: !!token && !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
