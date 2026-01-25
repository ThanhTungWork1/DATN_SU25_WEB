import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { message } from "antd";
import { TokenManager } from "../utils/tokenUtils";

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
        admin_token: localStorage.getItem("admin_token") ? "Có" : "Không",
      });

      const response = await axiosInstance.post("/change-password", {
        current_password,
        new_password,
        new_password_confirmation,
      });

      message.success(response.data.message || "Đổi mật khẩu thành công");

      // Nếu server yêu cầu đăng nhập lại (chỉ khi force_relogin = true)
      if (response.data.force_relogin === true) {
        console.log("🔄 Server yêu cầu đăng nhập lại sau khi đổi mật khẩu");

        // Xóa tất cả tokens và thông tin user
        TokenManager.clearAllTokens();
        localStorage.removeItem("user");
        localStorage.removeItem("role");

        // Redirect về trang login sau 2 giây
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        console.log("✅ Đổi mật khẩu thành công - giữ nguyên session");
      }

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
