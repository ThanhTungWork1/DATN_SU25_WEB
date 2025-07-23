import { useMutation } from "@tanstack/react-query";
import { login } from "../provider/authProvider";

type useLoginParams = {
  resource?: string;     // API endpoint (mặc định là /api/login cho user)
  forAdmin?: boolean;    // Nếu true, chỉ chấp nhận user.role === "1"
};

const useLogin = ({ resource = "/login", forAdmin = false }: useLoginParams) => {
  return useMutation({
    mutationFn: async (variables: { login: string; password: string }) => {
      const response = await login({ resource, variables });
      const { token, user } = response;

      if (!token) throw new Error("❌ Token không tồn tại");

      if (forAdmin) {
        if (user.role !== "1") {
          throw new Error("❌ Bạn không có quyền truy cập admin");
        }
        localStorage.setItem("admin_token", token);
        localStorage.setItem("role", "1");
        console.log("✅ Đăng nhập admin thành công:", user);
      } else {
        localStorage.setItem("user_token", token);
        localStorage.setItem("role", user.role);
        console.log("✅ Đăng nhập user thành công:", user);
      }

      return { token, user };
    },
  });
};

export default useLogin;
