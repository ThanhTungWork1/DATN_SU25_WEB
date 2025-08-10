import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/Admin/AdminLayout";
import Dashboard from "../pages/admin/dashboard/Dashboard";
import UserAdd from "../pages/admin/users/AddUser";
import ProductList from "../pages/admin/products/ProductsList";
import ProductForm from "../pages/admin/products/ProductForm";
import ProductDetail from "../pages/admin/products/ProductDetail";
import OrderList from "../pages/admin/orders/OrderList";
import OrderForm from "../pages/admin/orders/OrderForm";
import OrderDetail from "../pages/admin/orders/OrderDetail";
import AdminGuard from "../components/AdminGuard";
import { ContactAdmin } from "../pages/admin/contact/contactAdmin";
import UserList from "../pages/admin/users/UserList";
import UserEdit from "../pages/admin/users/UserEdit";
import CategoryList from "../pages/admin/categories/CategoryList";
import CommentList from "../pages/admin/comments/CommentList";
import InventoryPage from "../pages/admin/inventory/InventoryPage";
import VoucherPage from "../pages/admin/voucher/Voucher";
import VoucherDetail from "../pages/admin/voucher/VoucherDetail";
import BannerList from "../pages/admin/banners/BannerList";
import AdminLogin from "../pages/auth/adminLogin";

const AdminRoute = () => {
  return (
    <Routes>
      {/* Login route không cần authentication */}
      <Route path="login" element={<AdminLogin />} />

      {/* Các route khác cần authentication */}
      <Route element={<AdminGuard />}>
        <Route path="" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Sản phẩm */}
          <Route path="products" element={<ProductList />} />
          <Route path="products/create" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="products/detail/:id" element={<ProductDetail />} />
          
          {/* Đơn hàng */}
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/create" element={<OrderForm />} />
          <Route path="orders/edit/:id" element={<OrderForm />} />
          <Route path="orders/detail/:id" element={<OrderDetail />} />
          
          {/* Danh mục */}
          <Route path="categories" element={<CategoryList />} />
          
          {/* Banner */}
          <Route path="banners" element={<BannerList />} />
          
          {/* Đánh giá */}
          <Route path="comments" element={<CommentList />} />
          
          {/* Thành viên */}
          <Route path="users" element={<UserList />} />
          <Route path="users/list" element={<UserList />} />
          <Route path="users/create" element={<UserAdd />} />
          <Route path="users/edit/:id" element={<UserEdit />} />
          
          {/* Kho hàng/Tồn kho */}
          <Route path="inventory" element={<InventoryPage />} />
          
          {/* Voucher */}
          <Route path="vouchers" element={<VoucherPage />} />
          <Route path="vouchers/detail/:id" element={<VoucherDetail />} />
          <Route path="voucher" element={<VoucherPage />} /> {/* Keep old route for compatibility */}
          
          {/* Liên hệ */}
          <Route path="contacts" element={<ContactAdmin />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoute;
