import { Routes, Route, Navigate } from "react-router-dom";
import LayoutAdmin from "../components/LayoutAdmin";
import UserAdd from "../pages/admin/users/AddUser";
import ProductList from "../pages/admin/products/ProductsList";
import ProductForm from "../pages/admin/products/ProductForm";
import ProductDetail from "../pages/admin/products/ProductDetail";
import OrderList from "../pages/admin/orders/OrderList";
import OrderForm from "../pages/admin/orders/OrderForm";
import OrderDetail from "../pages/admin/orders/OrderDetail";
import RequireAuth from "./RequireAuth";
import { ContactAdmin } from "../pages/admin/contact/contactAdmin";
import RefundRequestList from "../pages/admin/refunds/RefundRequestList";
import UserList from "../pages/admin/users/UserList";
import UserEdit from "../pages/admin/users/UserEdit";
import CategoryList from "../pages/admin/categories/CategoryList";
import InventoryPage from "../pages/admin/inventory/InventoryPage";
import VoucherPage from "../pages/admin/voucher/Voucher";
import CategoryStatistics from "../pages/admin/categories/CategoryStatistics";
import ProductStatistics from "../pages/admin/products/ProductStatistics";
import HomeSectionList from "../pages/admin/home-sections/HomeSectionList";
import HomeSectionProducts from "../pages/admin/home-sections/HomeSectionProducts";
import BannerList from "../pages/admin/banners/BannerList";
import CommentList from "../pages/admin/comments/CommentList";
import Dashboard from "../pages/admin/dashboard/Dashboard";
import LoginPage from "../pages/auth/Login";

const AdminRoute = () => {
  console.log("🛣️ AdminRoute rendered");
  return (
    <Routes>
      {/* Admin Login Route - Không cần authentication */}
      <Route path="login" element={<LoginPage />} />

      {/* Admin Protected Routes */}
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
          <Route path="refund-requests" element={<RefundRequestList />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="voucher" element={<VoucherPage />} />
          <Route path="category-statistics" element={<CategoryStatistics />} />
          <Route path="product-statistics" element={<ProductStatistics />} />
          <Route path="home-sections" element={<HomeSectionList />} />
          <Route
            path="home-sections/:id/products"
            element={<HomeSectionProducts />}
          />
          <Route path="banners" element={<BannerList />} />
          <Route path="comments" element={<CommentList />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoute;
