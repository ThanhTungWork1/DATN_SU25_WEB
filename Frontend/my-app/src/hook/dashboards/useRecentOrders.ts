import { useQuery } from "@tanstack/react-query";
import { getList } from "../../provider/dataProvider1";

export const useRecentOrders = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recent-orders', limit],
    queryFn: async () => {
      try {
        const response = await getList({ 
          resource: "dashboard/recent-orders",
          params: { limit }
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching recent orders:", error);
        return [];
      }
    },
    staleTime: 0, // Không cache, luôn fetch mới
    refetchInterval: 10 * 1000, // Tự động refetch mỗi 10 giây
    refetchOnWindowFocus: true, // Refetch khi focus vào window
  });
}; 