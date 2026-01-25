import { useQuery } from "@tanstack/react-query";
import { getAllSizes } from "../api/ApiProduct";

export const useSizes = () =>
  useQuery({
    queryKey: ["sizes"],
    queryFn: getAllSizes,
    staleTime: 1000 * 60 * 10,
  }); 