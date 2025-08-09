import { Routes, Route, Navigate } from "react-router-dom";
import LayoutAdmin from "../components/LayoutAdmin";
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
import InventoryPage from "../pages/admin/inventory/InventoryPage";
import VoucherPage from "../pages/admin/voucher/Voucher";
import AdminLogin from "../pages/auth/adminLogin";
import CategoryStatistics from "../pages/admin/categories/CategoryStatistics";
import ProductStatistics from "../pages/admin/products/ProductStatistics";

const AdminRoute = () => {
  return (
    <Routes>
      {/* Login route không cần authentication */}
      <Route path="login" element={<AdminLogin />} />

      {/* Các route khác cần authentication */}
      <Route element={<RequireAuth allowedRoles={["admin"]} />}>
        <Route path="" element={<LayoutAdmin />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/list" element={<UserList />} />
          <Route path="users/create" element={<UserAdd />} />
          <Route path="users/edit/:id" element={<UserEdit />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/create" element={<ProductForm />} />
          <Route path="products/detail/:id" element={<ProductDetail />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/create" element={<OrderForm />} />
          <Route path="orders/edit/:id" element={<OrderForm />} />
          <Route path="orders/detail/:id" element={<OrderDetail />} />
          <Route path="contacts" element={<ContactAdmin />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="voucher" element={<VoucherPage />} />
          <Route path="category-statistics" element={<CategoryStatistics />} />
          <Route path="product-statistics" element={<ProductStatistics />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoute;
