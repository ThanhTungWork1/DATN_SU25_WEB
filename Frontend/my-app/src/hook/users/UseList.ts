import { useQuery } from "@tanstack/react-query";
import { getList } from "../../provider/dataProvider";


type useListParams = {
    resource: string;
}
<<<<<<< HEAD
<<<<<<< HEAD
=======
// useList({resource: 'users'})
>>>>>>> 01e18de4 ((admin): thêm chức năng hiển thị người dùng , chỉnh sửa người dùng, thêm người dùng, tìm kiếm người dùng)
=======
>>>>>>> df458680 (Trang dashboard tổng số người dùng, sản phẩm, đơn hàng, tỉ lệ tăng giảm người dùng theo tháng)

const useList = ({ resource }: useListParams) => {
    return useQuery({
        queryKey: [resource],
        queryFn: async () => getList({ resource }),
    });
}
export default useList;