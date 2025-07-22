import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { IUser } from "../types/users"; // Đảm bảo đúng path

const useCurrentUser = () => {
  const token = localStorage.getItem("token");

  return useQuery<IUser>({
    queryKey: ["currentUser"],
    queryFn: async (): Promise<IUser> => {
      const response = await axios.get<IUser>("http://localhost:8000/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: !!token,
  });
};

export default useCurrentUser;