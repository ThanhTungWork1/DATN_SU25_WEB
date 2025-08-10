import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { UseOrder } from '../types/UseOrder';

// Định nghĩa interface cho API response
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  pagination?: any;
}

export const useOrders = () => {
  const queryClient = useQueryClient();

  const getOrders = () =>
    useQuery<UseOrder[]>({
      queryKey: ['orders'],
      queryFn: async () => {
        try {
          const response = await axiosInstance.get<ApiResponse<UseOrder[]>>('/client/orders');
          
          if (!response.data.data) {
            return [];
          }
          
          return response.data.data;
        } catch (error: any) {
          console.error('❌ Error fetching orders:', error);
          throw error;
        }
      },
    });

  const getOrdersByStatus = (status: string) =>
    useQuery<UseOrder[]>({
      queryKey: ['orders', status],
      queryFn: async () => {
        try {
          const response = await axiosInstance.get<ApiResponse<UseOrder[]>>(`/client/orders/status/${status}`);
          
          if (!response.data.data) {
            return [];
          }
          
          return response.data.data;
        } catch (error: any) {
          console.error(`❌ Error fetching orders with status ${status}:`, error);
          throw error;
        }
      },
      enabled: !!status && status !== 'all',
    });

  const cancelOrder = useMutation({
    mutationFn: async (orderId: number) => {
      await axiosInstance.delete(`/client/orders/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const getOrderDetail = (id: number) =>
    useQuery<UseOrder>({
      queryKey: ['order', id],
      queryFn: async () => {
        try {
          const response = await axiosInstance.get<ApiResponse<UseOrder>>(`/client/orders/${id}`);
          
          if (!response.data.data) {
            throw new Error('Order not found');
          }
          
          return response.data.data;
        } catch (error) {
          console.error(`❌ Error fetching order ${id}:`, error);
          throw error;
        }
      },
      enabled: !!id,
    });

  return {
    getOrders,
    getOrdersByStatus,
    cancelOrder,
    getOrderDetail,
  };
};
