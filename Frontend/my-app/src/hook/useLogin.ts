import { useMutation } from "@tanstack/react-query";
import { login } from "../provider/authProvider";

type useLoginParams = {
  resource: string;
};

const useLogin = ({ resource }: useLoginParams) => {
  return useMutation({
    mutationFn: (variables: { login: string; password: string }) => {
      return login({ resource, variables });
    },
  });
};

export default useLogin;
