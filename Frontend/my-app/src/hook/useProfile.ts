import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { TokenManager } from "../utils/tokenUtils";

// Không cần props nữa vì sẽ luôn cập nhật thông tin user hiện tại
const useProfile = () => {
  return useMutation({
    mutationFn: async (updatedData: any) => {
      const token = TokenManager.getUserToken();

      if (!token) {
        throw new Error("Bạn cần đăng nhập để cập nhật thông tin");
      }

      console.log("Đang cập nhật thông tin profile:", updatedData);

      // Lấy user ID từ localStorage
      const userData = localStorage.getItem("user");
      if (!userData) {
        throw new Error("Không tìm thấy thông tin user");
      }

      const user = JSON.parse(userData);
      const userId = user.id;

      console.log("User ID để cập nhật:", userId);

      // Gọi API /update-profile để cập nhật thông tin user
      const response = await axios.put(
        `http://localhost:8000/api/update-profile`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Kết quả cập nhật profile:", response.data);

      // Cập nhật localStorage với thông tin mới
      if (response.data.data) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
        console.log("Đã cập nhật localStorage với thông tin mới");
      }

      return response.data;
    },
  });
};

export default useProfile;
