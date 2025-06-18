import { useQuery } from "@tanstack/react-query";
import { getList } from "../../provider/dataProvider";


type useListParams = {
    resource: string;
}
<<<<<<< HEAD
=======
// useList({resource: 'users'})
>>>>>>> 01e18de4 ((admin): thêm chức năng hiển thị người dùng , chỉnh sửa người dùng, thêm người dùng, tìm kiếm người dùng)

const useList = ({ resource }: useListParams) => {
    return useQuery({
        queryKey: [resource],
        queryFn: async () => getList({ resource }),
    });
}
export default useList;