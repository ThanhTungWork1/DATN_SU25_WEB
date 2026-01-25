import { useQuery } from "@tanstack/react-query";
import { getList } from "../../provider/dataProvider1";

// Cho phép filter theo số ngày HOẶC theo khoảng ngày (startDate, endDate - định dạng YYYY-MM-DD)
export const useRevenueByTime = (
  days: number | undefined = 30,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: [
      "revenue-by-time",
      days ?? null,
      startDate ?? null,
      endDate ?? null,
    ],
    queryFn: async () => {
      try {
        const params: Record<string, any> = {};
        if (startDate && endDate) {
          params.start_date = startDate;
          params.end_date = endDate;
        } else if (typeof days === "number") {
          params.days = days;
        }

        const response = await getList({
          resource: "dashboard/revenue-by-time",
          params,
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