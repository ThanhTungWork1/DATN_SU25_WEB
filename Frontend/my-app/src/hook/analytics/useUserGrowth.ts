import { useQuery } from "@tanstack/react-query";
import { getList } from "../../provider/dataProvider1";
import dayjs from "dayjs";

export const useUserGrowth = () => {
  return useQuery({
    queryKey: ["user-growth"],
    queryFn: async () => {
      const res = await getList({ resource: "users" });
      const users = res.data;

      const grouped: Record<string, number> = {};
      users.forEach((user: any) => {
        // ⚠️ Kiểm tra key đúng (có thể là created_at trong db.json)
        const createdAt = user.createdAt || user.created_at || user.date;
        if (!createdAt) return;

        const month = dayjs(createdAt).format("YYYY-MM");
        grouped[month] = (grouped[month] || 0) + 1;
      });

      const sorted = Object.keys(grouped).sort().reverse(); // mới → cũ
      const thisMonth = sorted[0] || "";
      const lastMonth = sorted[1] || "";

      const thisCount = grouped[thisMonth] || 0;
      const lastCount = grouped[lastMonth] || 0;

      const growth =
        lastCount === 0
          ? thisCount > 0
            ? 100
            : 0
          : ((thisCount - lastCount) / lastCount) * 100;

      return {
        thisMonth,
        lastMonth,
        thisCount,
        lastCount,
        growthPercent: growth,
      };
    },
  });
};
