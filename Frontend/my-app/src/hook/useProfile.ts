import { useMutation } from "@tanstack/react-query";
import publicAxios from "../utils/publicAxios";

type UseProfileProps = {
  resource: string;
  id: string;
};

const useProfile = ({ resource, id }: UseProfileProps) => {
  return useMutation({
    mutationFn: async (updatedData: any) => {
      const response = await publicAxios.put(`/${resource}/${id}`, updatedData);
      return response.data;
    },
  });
};

export default useProfile;