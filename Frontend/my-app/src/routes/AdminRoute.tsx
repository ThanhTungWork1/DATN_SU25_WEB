import { Routes, Route, Navigate } from "react-router-dom";
import LayoutAdmin from "../layouts/Admin/AdminLayout";
import Dashboard from "../pages/admin/dashboard/Dashboard";
import UserAdd from "../pages/admin/users/AddUser";
import ProductList from "../pages/admin/products/ProductsList";
import ProductForm from "../pages/admin/products/ProductForm";
import ProductDetail from "../pages/admin/products/ProductDetail";
import OrderList from "../pages/admin/orders/OrderList";
import OrderForm from "../pages/admin/orders/OrderForm";
import OrderDetail from "../pages/admin/orders/OrderDetail";
import RequireAuth from "./RequireAuth";
import { ContactAdmin } from "../pages/admin/contact/contactAdmin";
import UserList from "../pages/admin/users/UserList";
import UserEdit from "../pages/admin/users/UserEdit";
import CategoryList from "../pages/admin/categories/CategoryList";
import CommentList from "../pages/admin/comments/CommentList";

const AdminRoute = () => {
  return (
    <Routes>
      <Route element={<RequireAuth allowedRoles={["admin"]} />}>
        <Route path="" element={<LayoutAdmin />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Users Management */}
          <Route path="users" element={<UserList />} />
          <Route path="users/list" element={<UserList />} />
          <Route path="users/create" element={<UserAdd />} />
          <Route path="users/edit/:id" element={<UserEdit />} />
          
          {/* Products Management */}
          <Route path="products" element={<ProductList />} />
          <Route path="products/create" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="products/detail/:id" element={<ProductDetail />} />
          
          {/* Orders Management */}
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/create" element={<OrderForm />} />
          <Route path="orders/edit/:id" element={<OrderForm />} />
          <Route path="orders/detail/:id" element={<OrderDetail />} />
          
          {/* Categories Management */}
          <Route path="categories" element={<CategoryList />} />
          
          {/* Comments Management */}
          <Route path="comments" element={<CommentList />} />
          
          {/* Contact Management */}
          <Route path="contacts" element={<ContactAdmin />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoute;
