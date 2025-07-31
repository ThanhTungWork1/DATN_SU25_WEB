import { useQuery } from '@tanstack/react-query';
import { getList } from '../../provider/dataProvider1';

export const useInventoryList = (search: string = '', page: number = 1, perPage: number = 10) => {
  return useQuery({
    queryKey: ['inventoryList', search, page, perPage],
    queryFn: async () => {
      const response = await getList({
        resource: 'inventory/list',
        params: {
          search,
          page,
          per_page: perPage,
        },
      });
      return response.data;
    },
    staleTime: 0,
    refetchInterval: 10 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}; 