import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../provider/authProvider";


type useSigninParams = {
    resource: string,
}

const useLogin = ({ resource }: useSigninParams) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables: any) => {
            return signup({ resource, variables })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [resource]
            })
        }
    })
}

export default useLogin;