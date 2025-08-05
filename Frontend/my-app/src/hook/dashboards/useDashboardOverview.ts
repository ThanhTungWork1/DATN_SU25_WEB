import { useQuery } from "@tanstack/react-query";
import { getList } from "../../provider/dataProvider1";

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      try {
        const response = await getList({ resource: "dashboard" });
        return response.data;
      } catch (error) {
        console.error("Error fetching dashboard overview:", error);
        return {
          total_revenue: 0,
          orders_today: 0,
          new_users_this_month: 0,
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