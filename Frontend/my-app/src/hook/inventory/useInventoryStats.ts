import { useQuery } from '@tanstack/react-query';
import { getList } from '../../provider/dataProvider1';

export const useInventoryStats = () => {
  return useQuery({
    queryKey: ['inventoryStats'],
    queryFn: async () => {
      const response = await getList({
        resource: 'inventory/stats',
      });
      return response.data;
    },
    staleTime: 0,
    refetchInterval: 10 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}; 