import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { TokenManager } from "../utils/tokenUtils";

// Không cần props nữa vì sẽ luôn cập nhật thông tin user hiện tại
const useProfile = () => {
  return useMutation({
    mutationFn: async (updatedData: any) => {
      const token = TokenManager.getToken();
      
      if (!token) {
        throw new Error("Bạn cần đăng nhập để cập nhật thông tin");
      }

      console.log("Đang cập nhật thông tin profile:", updatedData);
      
      // Gọi API /me để cập nhật thông tin của chính user đang đăng nhập
      const response = await axios.put(
        `http://localhost:8000/api/me`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Kết quả cập nhật profile:", response.data);
      return response.data;
    },
  });
};

export default useProfile;