import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  submitReview,
  checkReviewEligibility,
  getProductReviews,
} from "../api/ApiUrl";
import { TokenManager } from "../utils/tokenUtils";
import { toast } from "react-toastify";
import type { Review } from "../types/ReviewType";

interface ReviewEligibility {
  can_review: boolean;
  reason: "eligible" | "not_logged_in" | "already_reviewed" | "not_purchased";
  message: string;
}

interface ReviewFormData {
  content: string;
  rating: number;
  orderId: number;
}

export const useReviewSystem = (productId: number, orderId?: number) => {
  const queryClient = useQueryClient();
  const [isFormVisible, setIsFormVisible] = useState(false);

  const token = TokenManager.getUserToken();

  // Query để lấy đánh giá của sản phẩm
  const { data: reviewsResponse, isLoading: reviewsLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: () => getProductReviews(productId),
  });

  const reviews: Review[] = (reviewsResponse?.data as Review[]) || [];

  // Query để kiểm tra quyền đánh giá
  const { data: eligibilityResponse, isLoading: eligibilityLoading } = useQuery(
    {
      queryKey: ["review-eligibility", productId, orderId, token],
      queryFn: () => checkReviewEligibility(productId, token!, orderId),
      enabled: !!token && !!orderId, // Chỉ gọi khi có token và orderId
    }
  );

  const eligibility: ReviewEligibility =
    (eligibilityResponse?.data as ReviewEligibility) || {
      can_review: false,
      reason: orderId ? "not_logged_in" : "missing_order_id",
      message: orderId
        ? "Bạn cần đăng nhập để đánh giá sản phẩm."
        : "Bạn cần mua sản phẩm để đánh giá.",
    };

  // Mutation để submit đánh giá
  const submitReviewMutation = useMutation({
    mutationFn: (reviewData: ReviewFormData) =>
      submitReview(
        {
          product_id: productId,
          order_id: reviewData.orderId,
          content: reviewData.content,
          rating: reviewData.rating,
        },
        token!
      ),
    onSuccess: (response) => {
      const isApproved = (response.data as any)?.comment?.status === 1;

      if (isApproved) {
        toast.success("Đánh giá của bạn đã được đăng thành công!");
      } else {
        toast.warning(
          "Đánh giá của bạn đang chờ kiểm duyệt do chứa từ ngữ không phù hợp."
        );
      }

      // Refresh data
      queryClient.invalidateQueries({
        queryKey: ["product-reviews", productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["review-eligibility", productId, orderId, token],
      });
      // Refresh order reviews if orderId is provided
      if (orderId) {
        queryClient.invalidateQueries({
          queryKey: ["order-reviews", orderId],
        });
        // Refresh orders list to update review count
        queryClient.invalidateQueries({
          queryKey: ["orders"],
        });
      }

      setIsFormVisible(false);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá!";
      toast.error(message);
    },
  });

  const handleSubmitReview = (reviewData: ReviewFormData) => {
    if (!token) {
      toast.error("Bạn cần đăng nhập để đánh giá sản phẩm!");
      return;
    }

    if (!reviewData.content.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    if (reviewData.rating < 1 || reviewData.rating > 5) {
      toast.error("Vui lòng chọn số sao từ 1 đến 5!");
      return;
    }

    submitReviewMutation.mutate(reviewData);
  };

  return {
    // Data
    reviews,
    eligibility,

    // Loading states
    reviewsLoading,
    eligibilityLoading,
    isSubmitting: submitReviewMutation.isPending,

    // Form state
    isFormVisible,
    setIsFormVisible,

    // Actions
    handleSubmitReview,

    // Computed states
    canShowForm: eligibility.can_review && token && !!orderId,
    isLoggedIn: !!token,
  };
};
