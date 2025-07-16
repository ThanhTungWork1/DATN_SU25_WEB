import { useQuery } from "@tanstack/react-query";
import { getOne } from "../provider/dataProvider1";


type useOneParams = {
    resource: string,
    id: number
}

const useOne = ({ resource, id }: useOneParams) => {
    return useQuery({
        queryKey: [resource, id],
        queryFn: () => getOne({ resource, id }),
    });

}
export default useOne;