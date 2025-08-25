import { useQuery } from "@tanstack/react-query";
import { getList } from "../../provider/dataProvider1";
import { useRevenueDate } from "../../contexts/RevenueDateContext";

export const useUserGrowth = () => {
  const { dateRange } = useRevenueDate();

  // Tạo query params cho date range
  const queryParams = dateRange
    ? {
        start_date: dateRange[0].format("YYYY-MM-DD"),
        end_date: dateRange[1].format("YYYY-MM-DD"),
      }
    : {};

  return useQuery({
    queryKey: ["user-growth", queryParams],
    queryFn: async () => {
      try {
        const response = await getList({
          resource: "dashboard/user-growth",
          params: queryParams,
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching user growth:", error);
        return {
          thisMonth: "",
          lastMonth: "",
          thisCount: 0,
          lastCount: 0,
          growthPercent: 0,
        };
      }
    },
    staleTime: 0, // Không cache, luôn fetch mới
    refetchInterval: 10 * 1000, // Tự động refetch mỗi 10 giây
    refetchOnWindowFocus: true, // Refetch khi focus vào window
  });
};
