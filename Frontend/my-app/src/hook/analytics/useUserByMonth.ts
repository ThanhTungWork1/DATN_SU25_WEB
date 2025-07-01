// hooks/analytics/useUserByMonth.ts
import { useQuery } from "@tanstack/react-query";
import { getList } from "../../provider/dataProvider";
import dayjs from "dayjs";

export const useUserByMonth = () => {
  return useQuery({
    queryKey: ["user-by-month"],
    queryFn: async () => {
      const response = await getList({ resource: "users" });
      const users = response.data;

      // Tạo map tháng -> số người dùng
      const countByMonth: Record<string, number> = {};

      users.forEach((user: any) => {
        const month = dayjs(user.created_at).format("YYYY-MM");
        countByMonth[month] = (countByMonth[month] || 0) + 1;
      });

      // Chuyển sang mảng để render biểu đồ
      const sortedData = Object.entries(countByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({
          month: dayjs(month).format("MMM YYYY"), // ví dụ: Jun 2024
          users: count,
        }));

      return sortedData;
    },
  });
};
