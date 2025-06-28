import { useEffect, useState } from "react";
<<<<<<< HEAD
import { getProductReviews } from "../api/ApiUrl";
=======
import { getProductReviews, getAllUsers } from "../api/ApiUrl";
>>>>>>> bc9cc18e (spa lai giao dien va cac file code, nang cap serch,filte)
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
        const commentsResponse = await getProductReviews(productId);
        setReviews(commentsResponse.data as Review[]);
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
