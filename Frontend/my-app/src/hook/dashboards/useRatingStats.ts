import { useQuery } from '@tanstack/react-query';
import { getList } from '../../provider/dataProvider1';

export const useRatingStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'rating-stats'],
    queryFn: async () => {
      try {
        const response = await getList({ resource: 'dashboard/rating-stats' });
        return response.data || [];
      } catch (error) {
        console.error('Error fetching rating stats:', error);
        return [];
      }
    },
    staleTime: 0, // Không cache, luôn fetch mới
    refetchInterval: 10 * 1000, // Tự động refetch mỗi 10 giây
    refetchOnWindowFocus: true, // Refetch khi focus vào window
  });
}; 