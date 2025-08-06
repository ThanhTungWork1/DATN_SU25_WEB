import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import axiosInstance from '../utils/axiosInstance';
import { UseOrder } from '../types/UseOrder';
import { transformOrders, transformOrder } from '../utils/orderTransform';

interface ApiResponse<T> {
  data: T;
  [key: string]: any;
}

export const useOrders = () => {
  const queryClient = useQueryClient();

  const getOrders = () =>
    useQuery<UseOrder[]>({
      queryKey: ['orders'],
      queryFn: async () => {

        try {
          const response = await axiosInstance.get<ApiResponse<any[]>>('/client/orders');
          
          if (!response.data.data) {
            return [];
          }
          
          return transformOrders(response.data.data);
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
          const response = await axiosInstance.get<ApiResponse<any[]>>(`/client/orders/status/${status}`);
          
          if (!response.data.data) {
            return [];
          }
          
          return transformOrders(response.data.data);
        } catch (error: any) {
          console.error(`❌ Error fetching orders with status ${status}:`, error);
          throw error;
        }
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
        try {
          const response = await axiosInstance.get<ApiResponse<any>>(`/client/orders/${id}`);
          
          if (!response.data.data) {
            throw new Error('Order not found');
          }
          
          return transformOrder(response.data.data);
        } catch (error) {
          console.error(`❌ Error fetching order ${id}:`, error);
          throw error;
        }
      },
      enabled: !!id,
    });

  // Thêm chức năng mua lại
  const reorder = useMutation({
    mutationFn: async (order: UseOrder) => {
      // Thêm tất cả sản phẩm từ đơn hàng vào giỏ hàng
      const addToCartPromises = order.items.map(item => 
        axiosInstance.post('/cart', {
          product_id: item.product_id,
          quantity: item.quantity
        })
      );
      
      await Promise.all(addToCartPromises);
    },
    onSuccess: () => {
      // Invalidate cart queries để cập nhật giỏ hàng
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  return {
    getOrders,
    getOrdersByStatus,
    cancelOrder,
    getOrderDetail,
    reorder,
  };
};
