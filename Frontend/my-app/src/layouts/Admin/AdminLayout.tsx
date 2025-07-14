// src/layouts/admin/AdminLayout.tsx

import React from "react";
import { Outlet, useLocation, useNavigate, Routes, Route } from "react-router-dom"; 
import { Layout, Menu, Space } from "antd";
import {
    ShoppingOutlined,
    ShoppingCartOutlined,
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

    const selectedKey =
        path.startsWith("/admin/products") ? "1"
        : path.startsWith("/admin/orders") ? "2"
        : path.startsWith("/login") ? "3"
        : "";

    return (
        <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={[
                {
                    key: "1",
                    icon: <ShoppingOutlined />,
                    label: <a href="/admin/products">Sản phẩm</a>,
                },
                {
                    key: "2",
                    icon: <ShoppingCartOutlined />,
                    label: <a href="/admin/orders">Đơn hàng</a>,
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