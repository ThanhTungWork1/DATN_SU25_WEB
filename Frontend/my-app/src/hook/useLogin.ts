import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../provider/authProvider";


type useLoginParams = {
    resource: string,
}

const useLogin = ({ resource }: useLoginParams) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variables: any) => {
            return login({ resource, variables })
        },
        onSuccess: (data) => {
            const res: any = data;
            if (res && res.token) {
                localStorage.setItem('token', res.token);
            }
            queryClient.invalidateQueries({
                queryKey: [resource]
            })
        }
    })
}

export default useLogin;