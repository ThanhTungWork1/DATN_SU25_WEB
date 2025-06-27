// src/hook/useRegister.ts
import { useMutation } from "@tanstack/react-query";
import { register } from "../provider/authProvider";

type useRegisterParams = {
  resource: string;
};

const useRegister = ({ resource }: useRegisterParams) => {
  return useMutation({
    mutationFn: (variables: any) => {
      return register({ resource, variables });
    },
  });
};

export default useRegister;
