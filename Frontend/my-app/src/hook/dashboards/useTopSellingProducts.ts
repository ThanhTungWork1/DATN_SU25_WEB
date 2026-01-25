import { useQuery } from "@tanstack/react-query";
import { getList } from "../../provider/dataProvider1";

export const useTopSellingProducts = (
  limit: number = 10,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ["top-selling-products", limit, startDate, endDate],
    queryFn: async () => {
      try {
        const params: Record<string, any> = { limit };

        if (startDate && endDate) {
          params.start_date = startDate;
          params.end_date = endDate;
        }

        const response = await getList({
          resource: "dashboard/top-selling-products",
          params,
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
