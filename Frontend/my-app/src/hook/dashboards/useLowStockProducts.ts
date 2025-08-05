import { useQuery } from '@tanstack/react-query';
import { getList } from '../../provider/dataProvider1';

export const useLowStockProducts = (limit: number = 5) => {
  return useQuery({
    queryKey: ['lowStockProducts', limit],
    queryFn: async () => {
      const response = await getList({
        resource: 'dashboard/low-stock-products',
        params: {
          limit: limit,
        },
      });
      return response.data;
    },
    staleTime: 0,
    refetchInterval: 10 * 1000, // 10 giây
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}; 