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
    console.log("🔐 Frontend - Forgot password request:", {
      email: data.email,
      timestamp: new Date().toISOString(),
    });

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("📡 Frontend - Calling forgotPasswordApi...");
      const res: ApiResponse = await forgotPasswordApi(data);

      console.log("✅ Frontend - Forgot password success:", {
        message: res.message,
        status_code: res.status_code,
        has_token: !!res.token,
      });

      setSuccess(res.message);
    } catch (err: any) {
      console.error("❌ Frontend - Forgot password error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
      });

      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    console.log("🔐 Frontend - Reset password request:", {
      email: data.email,
      has_token: !!data.token,
      has_password: !!data.password,
      has_confirmation: !!data.password_confirmation,
      timestamp: new Date().toISOString(),
    });

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("📡 Frontend - Calling resetPasswordApi...");
      const res: ApiResponse = await resetPasswordApi(data);

      console.log("✅ Frontend - Reset password success:", {
        message: res.message,
        status_code: res.status_code,
      });

      setSuccess(res.message);
    } catch (err: any) {
      console.error("❌ Frontend - Reset password error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
      });

      setError(err.response?.data?.message || "Có lỗi xảy ra");
      throw err; // Re-throw để component có thể xử lý
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, resetPassword, loading, error, success };
};
