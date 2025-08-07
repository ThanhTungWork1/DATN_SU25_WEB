// src/layouts/admin/AdminLayout.tsx

import React from "react";
import { Outlet, useLocation, useNavigate, Routes, Route } from "react-router-dom"; 
import { Layout, Menu, Space } from "antd";
import {
    ShoppingOutlined,
    ShoppingCartOutlined,
    AppstoreOutlined, // THÊM MỚI: Icon cho danh mục
    LogoutOutlined,
CommentOutlined
} from "@ant-design/icons";

// Import logo và Ant Design CSS (nếu chưa được import ở main.tsx)
// import logo from "../../../assets/image/logo.png"; // <-- Đảm bảo đường dẫn này đúng từ layouts/admin/ đến src/assets/

const { Header, Content, Sider } = Layout;

// --- Định nghĩa SidebarMenu (Có thể được dùng độc lập trong layout này) ---
function SidebarMenu() {
    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname;

    // SỬA ĐỔI: Thêm logic để highlight đúng menu item~
    const selectedKey =
        path.startsWith("/admin/products") ? "1"
        : path.startsWith("/admin/orders") ? "2"
        : path.startsWith("/admin/categories") ? "3" // Thêm điều kiện cho danh mục
        : path.startsWith("/admin/comments") ? "4" // THÊM MỚI: Logic highlight cho menu Đánh giá
        : path.startsWith("/admin/dashboard") ? "0"
        : "";

    const handleMenuClick = (key: string) => {
        switch (key) {
            case "0":
                navigate("/admin/dashboard");
                break;
            case "1":
                navigate("/admin/products");
                break;
            case "2":
                navigate("/admin/orders");
                break;
            case "3":
                navigate("/admin/categories");
                break;
            case "4":
                navigate("/admin/comments");
                break;
            case "logout":
                localStorage.removeItem("admin_token");
                localStorage.removeItem("role");
                navigate("/login/admin");
                break;
        }
    };

        return (
        <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={({ key }) => handleMenuClick(key)}
            items={[
                {
                    key: "0",
                    icon: <ShoppingOutlined />,
                    label: "Dashboard",
                },
                {
                    key: "1",
                    icon: <ShoppingOutlined />,
                    label: "Sản phẩm",
                },
                {
                    key: "2",
                    icon: <ShoppingCartOutlined />,
                    label: "Đơn hàng",
                },
                // THÊM MỚI: Thêm mục menu cho trang quản lý danh mục
                {
                    key: "3",
                    icon: <AppstoreOutlined />,
                    label: "Danh mục",
                },
                {
                    key: "4",
                    icon: <CommentOutlined />,
                    label: "Đánh giá",
                },
                {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: "Đăng xuất",
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
                    <div style={{ 
                        width: 45, 
                        height: 45, 
                        borderRadius: 8, 
                        background: "#1890ff", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        margin: "0 auto"
                    }}>
                        <span style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>A</span>
                    </div>
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
