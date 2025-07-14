import { useEffect, useState } from "react";
import { getProductReviews } from "../api/ApiUrl";
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
