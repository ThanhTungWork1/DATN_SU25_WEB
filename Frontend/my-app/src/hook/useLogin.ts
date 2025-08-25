import { useMutation } from "@tanstack/react-query";
import { login } from "../provider/authProvider";
import { TokenManager } from "../utils/tokenUtils"; // <-- BƯỚC 1: Import TokenManager

type useLoginParams = {
  resource?: string; // API endpoint (mặc định là /api/login cho user)
  forAdmin?: boolean; // Nếu true, chỉ chấp nhận user.role === "1"
};

const useLogin = ({
  resource = "/login",
  forAdmin = false,
}: useLoginParams) => {
  return useMutation({
    mutationFn: async (variables: { login: string; password: string }) => {
      const response = await login({ resource, variables });

      const { token, user } = response;

      if (!token) throw new Error("❌ Token không tồn tại");

      // BƯỚC 2: Sử dụng TokenManager để lưu token
      // 🔧 FIX: Tự động phát hiện role từ response thay vì dựa vào forAdmin
      console.log("🔐 useLogin - Lưu token với role:", user.role);

      if (user.role === 1) {
        // Admin
        console.log("🔐 useLogin - Lưu admin token");
        TokenManager.setToken(token, "admin");
      } else {
        // User thường
        console.log("🔐 useLogin - Lưu user token");
        TokenManager.setToken(token, "user");
      }

      // Log để debug
      console.log("🔐 useLogin - Token đã được lưu:");
      console.log(
        "  - admin_token:",
        localStorage.getItem("admin_token") ? "Có" : "Không"
      );
      console.log(
        "  - user_token:",
        localStorage.getItem("user_token") ? "Có" : "Không"
      );
      console.log("  - role:", localStorage.getItem("role"));

      const result = { token, user };

      return result;
    },
  });
};

export default useLogin;
