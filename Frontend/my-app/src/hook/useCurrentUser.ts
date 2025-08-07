import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { IUser } from "../types/users"; // Đảm bảo đúng path
import { TokenManager } from "../utils/tokenUtils";

const useCurrentUser = () => {
  const token = TokenManager.getToken();

  return useQuery<IUser>({
    queryKey: ["currentUser", token], // Thêm token vào queryKey để refetch khi token thay đổi
    queryFn: async (): Promise<IUser> => {
      if (!token) {
        throw new Error("Không có token xác thực");
      }
      
      const response = await axios.get<IUser>("http://localhost:8000/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Current user data:", response.data);
      return response.data;
    },
    enabled: !!token,
  });
};

export default useCurrentUser;