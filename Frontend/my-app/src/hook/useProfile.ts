import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type UseProfileProps = {
  resource: string;
  id: string;
};

const useProfile = ({ resource, id }: UseProfileProps) => {
  const token = localStorage.getItem("token");

  return useMutation({
    mutationFn: async (updatedData: any) => {
      const response = await axios.put(
        `http://localhost:8000/api/${resource}/${id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
  });
};

export default useProfile;
