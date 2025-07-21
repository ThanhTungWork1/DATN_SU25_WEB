import { useMutation } from "@tanstack/react-query";
import { login } from "../provider/authProvider";

type useLoginParams = {
  resource: string;
};

const useLogin = ({ resource }: useLoginParams) => {
  return useMutation({
    mutationFn: async (variables: { login: string; password: string }) => {
      const response = await login({ resource, variables });

      const { token, user } = response; // ✅ KHÔNG dùng .data nữa

      if (!token) throw new Error("Token không tồn tại");

      // ✅ Lưu token và role vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role); // 👈 Thêm dòng này

      console.log("✅ Đăng nhập thành công:", user); // 👀 Xem user có role chưa

      return user;
    },
  });
};

export default useLogin;
