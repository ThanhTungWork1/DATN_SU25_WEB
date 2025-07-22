// src/routes/AdminRoute.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import LayoutAdmin from "../components/LayoutAdmin";
import Dashboard from "../pages/admin/dashboard/Dashboard";
import UserAdd from "../pages/admin/users/AddUser";
import ProductList from "../pages/admin/products/ProductsList";
import ProductForm from "../pages/admin/products/ProductForm";
import OrderList from "../pages/admin/orders/OrderList";
import OrderForm from "../pages/admin/orders/OrderForm";
import OrderDetail from "../pages/admin/orders/OrderDetail";
import RequireAuth from "./RequireAuth";

const AdminRoute = () => {
  return (
    <Routes>
      <Route element={<RequireAuth allowedRoles={["admin"]} />}>
        <Route path="" element={<LayoutAdmin />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users/create" element={<UserAdd />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/create" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/create" element={<OrderForm />} />
          <Route path="orders/edit/:id" element={<OrderForm />} />
          <Route path="orders/detail/:id" element={<OrderDetail />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoute;
