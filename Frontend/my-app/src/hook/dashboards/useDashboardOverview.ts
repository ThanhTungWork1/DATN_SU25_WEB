import { useQuery } from "@tanstack/react-query";
import { getList } from "../../provider/dataProvider1";
import { useRevenueDate } from "../../contexts/RevenueDateContext";

export const useDashboardOverview = () => {
  const { dateRange } = useRevenueDate();

  // Tạo query params cho date range
  const queryParams = dateRange
    ? {
        start_date: dateRange[0].format("YYYY-MM-DD"),
        end_date: dateRange[1].format("YYYY-MM-DD"),
      }
    : {};

  return useQuery({
    queryKey: ["dashboard-overview", queryParams],
    queryFn: async () => {
      try {
        const response = await getList({
          resource: "dashboard",
          params: queryParams,
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching dashboard overview:", error);
        return {
          total_revenue: 0,
          orders_in_period: 0,
          new_users_in_period: 0,
          total_products: 0,
          total_categories: 0,
          total_contacts: 0,
          pending_orders: 0,
          total_reviews: 0,
          average_rating: 0,
        };
      }
    },
    staleTime: 0, // Không cache, luôn fetch mới
    refetchInterval: 10 * 1000, // Tự động refetch mỗi 10 giây
    refetchOnWindowFocus: true, // Refetch khi focus vào window
    refetchOnMount: true, // Refetch khi component mount
  });
};
