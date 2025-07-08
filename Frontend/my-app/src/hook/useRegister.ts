import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../provider/authProvider";


type useSignupParams = {
    resource: string,
}

const useRegister = ({ resource }: useSignupParams) => {
    return useMutation({
        mutationFn: (variables: any) => {
            return signup({ resource, variables })
        },
    })
}

export default useRegister;