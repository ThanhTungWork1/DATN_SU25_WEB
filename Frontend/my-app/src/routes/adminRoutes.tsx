import React from "react";
import { Route } from "react-router-dom";

// Sản phẩm
import ProductList from "../pages/admin/products/ProductsList"
import ProductForm from "../pages/admin/products/ProductForm";

// Đơn hàng
import OrderList from "../pages/admin/orders/OrderList";
import OrderForm from "../pages/admin/orders/OrderForm";
import OrderDetail from "../pages/admin/orders/OrderDetail";

export const adminRoutes = (
  <>
    {/* Sản phẩm */}
    <Route path="/admin/products" element={<ProductList />} key="product-list" />
    <Route path="/admin/products/create" element={<ProductForm />} key="product-create" />
    <Route path="/admin/products/edit/:id" element={<ProductForm />} key="product-edit" />

    {/* Đơn hàng */}
    <Route path="/admin/orders" element={<OrderList />} key="order-list" />
    <Route path="/admin/orders/create" element={<OrderForm />} key="order-create" />
    <Route path="/admin/orders/edit/:id" element={<OrderForm />} key="order-edit" />
    <Route path="/admin/orders/detail/:id" element={<OrderDetail />} key="order-detail" />
  </>
);
