import { useQuery } from "@tanstack/react-query";
import { getList } from "../../provider/dataProvider1";

export const useUserGrowth = () => {
  return useQuery({
    queryKey: ["user-growth"],
    queryFn: async () => {
      try {
        const response = await getList({ resource: "dashboard/user-growth" });
        console.log("User Growth API Response:", response);
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
