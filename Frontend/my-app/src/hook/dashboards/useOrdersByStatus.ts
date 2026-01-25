import { useQuery } from "@tanstack/react-query";
import { getList } from "../../provider/dataProvider1";
import { useRevenueDate } from "../../contexts/RevenueDateContext";

export const useOrdersByStatus = () => {
  const { dateRange } = useRevenueDate();

  // Tạo query params cho date range
  const queryParams = dateRange
    ? {
        start_date: dateRange[0].format("YYYY-MM-DD"),
        end_date: dateRange[1].format("YYYY-MM-DD"),
      }
    : {};

  return useQuery({
    queryKey: ["orders-by-status", queryParams],
    queryFn: async () => {
      try {
        const response = await getList({
          resource: "dashboard/orders-by-status",
          params: queryParams,
        });
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
