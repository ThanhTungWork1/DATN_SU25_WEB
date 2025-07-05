import { useQuery } from "@tanstack/react-query";
import { getAllCategories } from "../api/ApiProduct";

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
    staleTime: 1000 * 60 * 10,
  }); 