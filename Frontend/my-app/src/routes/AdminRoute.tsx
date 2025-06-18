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