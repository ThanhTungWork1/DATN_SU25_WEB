import { useQuery } from "@tanstack/react-query";
import { getList } from "../../provider/dataProvider1";

export const useTopSellingProducts = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-selling-products', limit],
    queryFn: async () => {
      try {
        const response = await getList({ 
          resource: "dashboard/top-selling-products",
          params: { limit }
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching top selling products:", error);
        return [];
      }
    },
    staleTime: 0, // Không cache, luôn fetch mới
    refetchInterval: 10 * 1000, // Tự động refetch mỗi 10 giây
    refetchOnWindowFocus: true, // Refetch khi focus vào window
  });
}; 