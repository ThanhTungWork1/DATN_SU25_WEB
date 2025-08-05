import { useQuery } from "@tanstack/react-query";
import { getList } from "../../provider/dataProvider1";

export const useOrdersByStatus = () => {
  return useQuery({
    queryKey: ['orders-by-status'],
    queryFn: async () => {
      try {
        const response = await getList({ resource: "dashboard/orders-by-status" });
        return response.data;
      } catch (error) {
        console.error("Error fetching orders by status:", error);
        return [];
      }
    },
    staleTime: 0, // Không cache, luôn fetch mới
    refetchInterval: 10 * 1000, // Tự động refetch mỗi 10 giây
    refetchOnWindowFocus: true, // Refetch khi focus vào window
  });
}; 