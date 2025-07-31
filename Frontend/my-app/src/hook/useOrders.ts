import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UseOrder } from '../types/UseOrder';

export const useOrders = () => {
  const queryClient = useQueryClient();

  const getOrders = () =>
    useQuery<UseOrder[]>({
      queryKey: ['orders'],
      queryFn: async () => {
        const { data } = await axios.get<UseOrder[]>('/api/client/orders');
        return data;
      },
    });

  const getOrdersByStatus = (status: string) =>
    useQuery<UseOrder[]>({
      queryKey: ['orders', status],
      queryFn: async () => {
        const { data } = await axios.get<UseOrder[]>(`/api/client/orders/status/${status}`);
        return data;
      },
      enabled: !!status,
    });

  const cancelOrder = useMutation({
    mutationFn: async (orderId: number) => {
      await axios.delete(`/api/client/orders/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const getOrderDetail = (id: number) =>
    useQuery<UseOrder>({
      queryKey: ['order', id],
      queryFn: async () => {
        const { data } = await axios.get<UseOrder>(`/api/client/orders/${id}`);
        return data;
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
