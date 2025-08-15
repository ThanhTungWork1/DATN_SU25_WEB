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
      if (forAdmin) {
        if (user.role !== 1) {
          throw new Error("❌ Bạn không có quyền truy cập admin");
        }
        TokenManager.setToken(token, "admin"); // <-- SỬA Ở ĐÂY
      } else {
        TokenManager.setToken(token, "user"); // <-- VÀ SỬA Ở ĐÂY
      }

      const result = { token, user };

      return result;
    },
  });
};

export default useLogin;
