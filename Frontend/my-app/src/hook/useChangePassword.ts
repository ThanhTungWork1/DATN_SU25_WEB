import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { message } from "antd";

export const useChangePassword = () => {
  const [loading, setLoading] = useState(false);

  const changePassword = async (
    current_password: string,
    new_password: string,
    new_password_confirmation: string
  ) => {
    try {
      setLoading(true);
      
      console.log("🔍 Change password request:", {
        current_password: current_password ? "Có" : "Không",
        new_password: new_password ? "Có" : "Không",
        new_password_confirmation: new_password_confirmation ? "Có" : "Không",
        role: localStorage.getItem("role"),
        user_token: localStorage.getItem("user_token") ? "Có" : "Không",
        admin_token: localStorage.getItem("admin_token") ? "Có" : "Không"
      });

      const response = await axiosInstance.post("/change-password", {
        current_password,
        new_password,
        new_password_confirmation,
      });

      message.success(response.data.message || "Đổi mật khẩu thành công");
      return true;
    } catch (error: any) {
      console.error("❌ Change password error:", error.response?.data);
      message.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading };
};
