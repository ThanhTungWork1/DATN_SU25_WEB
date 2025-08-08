import { useQuery } from "@tanstack/react-query";
import { getList } from "../../provider/dataProvider1";

export const useRevenueByTime = (days: number = 30) => {
  return useQuery({
    queryKey: ['revenue-by-time', days],
    queryFn: async () => {
      try {
        const response = await getList({ 
          resource: "dashboard/revenue-by-time",
          params: { days }
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching revenue by time:", error);
        return [];
      }
    },
    staleTime: 0, // Không cache, luôn fetch mới
    refetchInterval: 10 * 1000, // Tự động refetch mỗi 10 giây
    refetchOnWindowFocus: true, // Refetch khi focus vào window
  });
}; 