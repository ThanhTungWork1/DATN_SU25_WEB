<<<<<<< HEAD

import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import LayoutAdmin from "../components/LayoutAdmin";
import UserList from "../pages/admin/users/UserList";
import UserAdd from "../pages/admin/users/AddUser";
import Dashboard from "../pages/admin/dashboard/Dashboard";

const AdminRoute = () => {
  return (
    <Routes>
      <Route path="/admin" element={<LayoutAdmin />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Outlet />}>
          <Route index element={<UserList />} />
          <Route path="create" element={<UserAdd />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoute;
=======
import type { RouteObject } from "react-router-dom";
import LayoutAdmin from "../components/LayoutAdmin";
import UserList from "../pages/admin/users/UserList";
import UserEdit from "../pages/admin/users/UserEdit";
import UserAdd from "../pages/admin/users/AddUser";


const AdminRoute: RouteObject[] = [
    {
      path:"/admin",
      element: <LayoutAdmin/>,
      children:[
        {
          path:"users",
          element:<UserList/>
        },
        {
          path:"users/edit/:id",
          element:<UserEdit/>
        },
        {
          path:"users/create",
          element:<UserAdd/>
        }
      ]
    }
];

export default AdminRoute
>>>>>>> 01e18de4 ((admin): thêm chức năng hiển thị người dùng , chỉnh sửa người dùng, thêm người dùng, tìm kiếm người dùng)
