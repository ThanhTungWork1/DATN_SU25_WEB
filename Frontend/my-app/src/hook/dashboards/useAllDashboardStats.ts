import { useQuery } from "@tanstack/react-query";
import { getList } from "../../provider/dataProvider1";

export const useAllDashboardStats = () => {
  return useQuery({
    queryKey: ['all-dashboard-stats'],
    queryFn: async () => {
      try {
        const response = await getList({ resource: "dashboard/all-stats" });
        return response.data;
      } catch (error) {
        console.error("Error fetching all dashboard stats:", error);
        return {
          overview: {
            total_revenue: 0,
            orders_today: 0,
            new_users_this_month: 0,
            total_products: 0,
            total_categories: 0,
            total_contacts: 0,
            pending_orders: 0,
          },
          revenue_by_time: [],
          orders_by_status: [],
          top_products: [],
          recent_orders: [],
          recent_users: [],
          user_growth: {
            thisCount: 0,
            lastCount: 0,
            growthPercent: 0,
          },
        };
      }
    },
    staleTime: 0, // Không cache, luôn fetch mới
    refetchInterval: 10 * 1000, // Tự động refetch mỗi 10 giây
    refetchOnWindowFocus: true, // Refetch khi focus vào window
  });
}; 