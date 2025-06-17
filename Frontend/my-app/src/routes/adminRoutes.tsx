    import React from "react";
    import { Route } from "react-router-dom";
    import ProductList from "../pages/admin/products/ProductsList";
    import ProductForm from "../pages/admin/products/ProductForm";

    export const adminRoutes = [
    <Route path="/admin/products" element={<ProductList />} key="list" />,
    <Route path="/admin/products/create" element={<ProductForm />} key="create" />,
    <Route path="/admin/products/edit/:id" element={<ProductForm />} />

    ];