import { useState } from "react";
import { forgotPasswordApi, resetPasswordApi } from "../api/ApiUrl";
import type {
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ApiResponse,
} from "../types/auth";

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const forgotPassword = async (data: ForgotPasswordRequest) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res: ApiResponse = await forgotPasswordApi(data);
      setSuccess(res.message);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res: ApiResponse = await resetPasswordApi(data);
      setSuccess(res.message);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, resetPassword, loading, error, success };
};
