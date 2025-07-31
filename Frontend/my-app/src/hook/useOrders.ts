import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UseOrder } from '../types/UseOrder';
import { 
    getClientOrders, 
    getClientOrder, 
    getClientOrdersByStatus, 
    deleteClientOrder,
    getClientOrderStatistics
} from '../api/order';

export const useOrders = () => {
    const queryClient = useQueryClient();

    const getOrders = () =>
        useQuery<UseOrder[]>({
            queryKey: ['orders'],
            queryFn: async () => {
                const { data } = await getClientOrders();
                return data.data || [];
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
        });

    const getOrdersByStatus = (status: string) =>
        useQuery<UseOrder[]>({
            queryKey: ['orders', status],
            queryFn: async () => {
                const { data } = await getClientOrdersByStatus(status);
                return data.data || [];
            },
            enabled: !!status && status !== 'all',
        });

    const cancelOrder = useMutation({
        mutationFn: async (orderId: number) => {
            await deleteClientOrder(orderId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
        onError: (error) => {
            console.error('Failed to cancel order:', error);
        }
    });

    const getOrderDetail = (id: number) =>
        useQuery<UseOrder>({
            queryKey: ['order', id],
            queryFn: async () => {
                const { data } = await getClientOrder(id);
                return data.data;
            },
            enabled: !!id,
        });

    const getOrderStatistics = () =>
        useQuery({
            queryKey: ['order-statistics'],
            queryFn: async () => {
                const { data } = await getClientOrderStatistics();
                return data.data;
            },
            staleTime: 10 * 60 * 1000, // 10 minutes
        });

    return {
        getOrders,
        getOrdersByStatus,
        cancelOrder,
        getOrderDetail,
        getOrderStatistics,
    };
};
