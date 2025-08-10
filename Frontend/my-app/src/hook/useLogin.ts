import { useMutation } from "@tanstack/react-query";
import { login } from "../provider/authProvider";
import { TokenManager } from "../utils/tokenUtils"; // <-- BƯỚC 1: Import TokenManager

type useLoginParams = {
  resource?: string;     // API endpoint (mặc định là /api/login cho user)
  forAdmin?: boolean;    // Nếu true, chỉ chấp nhận user.role === "1"
};

const useLogin = ({ resource = "/login", forAdmin = false }: useLoginParams) => {
  return useMutation({
    mutationFn: async (variables: { login: string; password: string }) => {
      console.log("=== MUTATION STARTED ===");
      console.log("Variables:", variables);
      
      const response = await login({ resource, variables });
      console.log("Login response:", response);
      
      const { token, user } = response;
      console.log("Destructured data:", { token, user });

      if (!token) throw new Error("❌ Token không tồn tại");

      // BƯỚC 2: Sử dụng TokenManager để lưu token
      if (forAdmin) {
        if (user.role !== 1) {
          throw new Error("❌ Bạn không có quyền truy cập admin");
        }
        TokenManager.setToken(token, 'admin'); // <-- SỬA Ở ĐÂY
        console.log("✅ Đăng nhập admin thành công:", user);
      } else {
        TokenManager.setToken(token, 'user'); // <-- VÀ SỬA Ở ĐÂY
        console.log("✅ Đăng nhập user thành công:", user);
      }

      const result = { token, user };
      console.log("=== MUTATION COMPLETED ===");
      console.log("Returning result:", result);
      return result;
    },
  });
};

export default useLogin;