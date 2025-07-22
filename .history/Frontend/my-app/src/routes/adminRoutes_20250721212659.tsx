import { Route } from "react-router-dom";
import AdminLayout from "../layouts/Admin/AdminLayout";
import ProductList from "../pages/admin/products/ProductsList";
import ProductForm from "../pages/admin/products/ProductForm";
import OrderList from "../pages/admin/orders/OrderList";
import OrderForm from "../pages/admin/orders/OrderForm";
import OrderDetail from "../pages/admin/orders/OrderDetail";

export const adminRoutes = (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<h1>Chào mừng đến với Admin Panel!</h1>} />{" "}
    {/* Sản phẩm */}
    <Route path="products" element={<ProductList />} />
    <Route path="products/create" element={<ProductForm />} />
    <Route path="products/edit/:id" element={<ProductForm />} />
    {/* Đơn hàng */}
    <Route path="orders" element={<OrderList />} />
    <Route path="orders/create" element={<OrderForm />} />
    <Route path="orders/edit/:id" element={<OrderForm />} />
    <Route path="orders/detail/:id" element={<OrderDetail />} />
  </Route>
);
