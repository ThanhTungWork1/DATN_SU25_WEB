import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import LayoutAdmin from "../components/LayoutAdmin";
import UserList from "../pages/admin/users/UserList";
import UserAdd from "../pages/admin/users/AddUser";
import Dashboard from "../pages/admin/dashboard/Dashboard";
import ProductList from "../pages/admin/products/ProductsList";
import ProductForm from "../pages/admin/products/ProductForm";
import OrderList from "../pages/admin/orders/OrderList";
import OrderForm from "../pages/admin/orders/OrderForm";
import OrderDetail from "../pages/admin/orders/OrderDetail";
import { Contact } from "../pages/admin/contact/contact";

const AdminRoute = () => {
  return (
    <Routes>
      <Route path="" element={<LayoutAdmin />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Outlet />}>
          <Route index element={<UserList />} />
          <Route path="create" element={<UserAdd />} />
        </Route>
        {/* Sản phẩm */}
        <Route path="products" element={<ProductList />} />
        <Route path="products/create" element={<ProductForm />} />
        <Route path="products/edit/:id" element={<ProductForm />} />
        {/* Đơn hàng */}
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/create" element={<OrderForm />} />
        <Route path="orders/edit/:id" element={<OrderForm />} />
        <Route path="orders/detail/:id" element={<OrderDetail />} />
        {/* Liên hệ */}
        <Route path="contacts" element={<Contact />} />
        {/* Thêm các route con khác ở đây nếu cần */}
      </Route>
    </Routes>
  );
};

export default AdminRoute;
