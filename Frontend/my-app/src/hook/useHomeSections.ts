// src/hooks/useHomeSections.ts
import { useQuery } from "@tanstack/react-query";
import { HomeSectionResponse } from "../types/HomeSection";
import axios from "axios";

export const useHomeSections = () => {
  return useQuery({
    queryKey: ["home-sections"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:8000/api/home"); // Đổi URL nếu cần
      return res.data as HomeSectionResponse;
    },
  });
};
