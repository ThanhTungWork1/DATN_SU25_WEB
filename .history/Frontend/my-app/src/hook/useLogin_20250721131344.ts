import { useMutation } from "@tanstack/react-query";
import { login } from "../provider/authProvider";

type useLoginParams = {
  resource: string;
};

const useLogin = ({ resource }: useLoginParams) => {
  return useMutation({
<<<<<<< HEAD
    mutationFn: (variables: any) => {
=======
    mutationFn: (variables: { login: string; password: string }) => {
>>>>>>> origin/ThanhTung_profile_home_auth
      return login({ resource, variables });
    },
  });
};

export default useLogin;
