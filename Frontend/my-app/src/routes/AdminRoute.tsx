import { Navigate, Outlet, type RouteObject } from "react-router-dom";
import LayoutAdmin from "../components/LayoutAdmin";
import UserList from "../pages/admin/users/UserList";
import UserEdit from "../pages/admin/users/UserEdit";
import UserAdd from "../pages/admin/users/AddUser";
import Dashboard from "../pages/admin/dashboard/Dashboard";


const AdminRoute: RouteObject[] = [
  {
    path: "/admin",
    element: <LayoutAdmin />,
    children: [
      {
        index:true,
        element:<Navigate to="dashboard" replace />
      },
      {
        path: "dashboard",
        element: <Dashboard />
      },
      {
        path: "users",
        element: <Outlet />,
        children: [
          {
            index: true,
            element:<UserList/>
          },
          {
            path: "edit/:id",
            element: <UserEdit/>
          },
          {
            path: "create",
            element: <UserAdd />
          }
        ]
      }
    ]
  }
];

export default AdminRoute