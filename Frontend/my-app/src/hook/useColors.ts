import { useQuery } from "@tanstack/react-query";
import { getAllColors } from "../api/ApiProduct";

export const useColors = () =>
  useQuery({
    queryKey: ["colors"],
    queryFn: getAllColors,
    staleTime: 1000 * 60 * 10,
  }); 