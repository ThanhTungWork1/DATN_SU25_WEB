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
      if (user.role === 1) {
        // Admin
        TokenManager.setToken(token, "admin");
      } else {
        // User thường
        TokenManager.setToken(token, "user");
      }

      const result = { token, user };

      return result;
    },
  });
};

export default useLogin;
