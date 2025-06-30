import { useEffect, useState } from "react";
import { getProductReviews, getAllUsers } from "../api/ApiUrl";
import type { Review } from "../types/ReviewType";

export const useProductReviews = (productId: number) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        // =============================
        // 1. Lấy danh sách đánh giá (comments) cho sản phẩm
        // =============================
        const commentsResponse = await getProductReviews(productId);
        // 2. Lấy danh sách user để join vào đánh giá
        const usersResponse = await getAllUsers();

        const commentsData = commentsResponse.data as any[];
        const usersData = usersResponse.data as any[];

        // 3. Tạo map user để join nhanh
        const userMap = new Map(
          usersData.map((user: any) => [Number(user.id), user]),
        );

        // 4. Join user vào từng review
        const combinedReviews = commentsData.map((comment: any) => ({
          ...comment,
          user: userMap.get(Number(comment.user_id)) || {
            id: 0,
            username: "Người dùng ẩn danh",
          },
        }));

        setReviews(combinedReviews);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu đánh giá:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  return { reviews, isLoading };
};
