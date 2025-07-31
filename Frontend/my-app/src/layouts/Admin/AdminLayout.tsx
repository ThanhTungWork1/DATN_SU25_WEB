// src/layouts/admin/AdminLayout.tsx

import React from "react";
import { Outlet, useLocation, useNavigate, Routes, Route } from "react-router-dom"; 
import { Layout, Menu, Space } from "antd";
import {
    DashboardOutlined,
    UserOutlined,
    AppstoreOutlined,
    ShoppingOutlined,
    InboxOutlined, // Icon cho tồn kho
    ShoppingCartOutlined,
    ContactsOutlined,
    LogoutOutlined,
} from "@ant-design/icons";

// Import logo và Ant Design CSS (nếu chưa được import ở main.tsx)
import "antd/dist/reset.css"; // Chỉ cần import một lần ở đây hoặc main.tsx
import logo from "../../assets/logo.png"; // <-- Đảm bảo đường dẫn này đúng từ layouts/admin/ đến src/assets/

const { Header, Content, Sider } = Layout;

// --- Định nghĩa SidebarMenu (Có thể được dùng độc lập trong layout này) ---
function SidebarMenu() {
    const location = useLocation();
    const path = location.pathname;

        // SỬA ĐỔI: Thêm logic để highlight đúng menu item
    const selectedKey =
        path.startsWith("/admin/dashboard") ? "1"
        : path.startsWith("/admin/users") ? "2"
        : path.startsWith("/admin/categories") ? "3"
        : path.startsWith("/admin/products") ? "4"
        : path.startsWith("/admin/inventory") ? "5" // Thêm điều kiện cho tồn kho
        : path.startsWith("/admin/orders") ? "6"
        : path.startsWith("/admin/contacts") ? "7"
        : "";

    return (
        <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
                        items={[
                {
                    key: "1",
                    icon: <DashboardOutlined />,
                    label: <a href="/admin/dashboard">Dashboard</a>,
                },
                {
                    key: "2",
                    icon: <UserOutlined />,
                    label: <a href="/admin/users">Thành viên</a>,
                },
                {
                    key: "3",
                    icon: <AppstoreOutlined />,
                    label: <a href="/admin/categories">Danh mục</a>,
                },
                {
                    key: "4",
                    icon: <ShoppingOutlined />,
                    label: <a href="/admin/products">Sản phẩm</a>,
                },
                // THÊM MỚI: Thêm mục menu cho trang quản lý tồn kho
                {
                    key: "5",
                    icon: <InboxOutlined />,
                    label: <a href="/admin/inventory">Tồn kho</a>,
                },
                {
                    key: "6",
                    icon: <ShoppingCartOutlined />,
                    label: <a href="/admin/orders">Đơn hàng</a>,
                },
                {
                    key: "7",
                    icon: <ContactsOutlined />,
                    label: <a href="/admin/contacts">Liên hệ</a>,
                },
            ]}
        />
    );
}

// --- Định nghĩa AdminLayout (Thay thế AppLayout trước đó) ---
// Đây là component layout chính cho trang Admin
export default function AdminLayout() {
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider breakpoint="lg" collapsedWidth="0">
                <div style={{ textAlign: "center", padding: 20 }}>
                    <img src={logo} alt="Admin Panel" style={{ width: 45, borderRadius: 8 }} />
                    <div style={{ color: "white", marginTop: 8, fontWeight: "bold" }}>Admin Panel</div>
                </div>
                <SidebarMenu />
            </Sider>

            <Layout>
                <Header style={{ background: "#fff", padding: 0 }} />
                <Content style={{ margin: "24px 16px 0" }}>
                    <div style={{ padding: 24, minHeight: 360 }}>
                        {/* * Outlet sẽ render các route con của Admin (ví dụ: ProductList, OrderList). 
                         * Các route này được định nghĩa trong src/routes/adminRoutes.tsx
                         */}
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
