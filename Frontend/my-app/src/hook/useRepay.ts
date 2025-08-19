import { useMutation } from "@tanstack/react-query";
import { createVNPayPayment } from "../api/ApiUrl";
import { toast } from "sonner";

export const useRepay = () => {
  const token = localStorage.getItem("user_token") || "";

  const repayMutation = useMutation({
    mutationFn: async ({ orderId }: { orderId: number }) => {
      if (!token) {
        throw new Error("User not authenticated");
      }
      return createVNPayPayment(orderId, token);
    },
    onSuccess: (response) => {
      const paymentUrl = (response.data as any)?.payment_url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.error("Không thể lấy được liên kết thanh toán. Vui lòng thử lại.");
      }
    },
    onError: (error: any) => {
      console.error("Repay error:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể tạo thanh toán. Vui lòng thử lại sau."
      );
    },
  });

  return {
    repay: repayMutation.mutate,
    isRepaying: repayMutation.isPending,
  };
};
