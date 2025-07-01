import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getUpdateProfile } from "../provider/dataProvider";

type useProfileParam = {
    resource: string;
    id: number;
}

const useProfile = ({resource, id}: useProfileParam) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (variable: any) => {
            return getUpdateProfile({resource, variable, id})
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [resource, id]
            })
        }
    })
}

export default useProfile