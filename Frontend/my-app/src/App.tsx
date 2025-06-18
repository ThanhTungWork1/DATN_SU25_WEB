import React from "react";
import logo from "./assets/logo.png";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { adminRoutes } from "./routes/adminRoutes";
import "antd/dist/reset.css";
import { Layout, Menu } from "antd";
import {
  ShoppingOutlined,
  ShoppingCartOutlined,
  LoginOutlined,
} from "@ant-design/icons";

const { Header, Content, Sider } = Layout;

function SidebarMenu() {
  const location = useLocation();
  const path = location.pathname;

  // Lấy key tương ứng với URL hiện tại
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
        // {
        //   key: "3",
        //   icon: <LoginOutlined />,
        //   label: <a href="/login">Đăng nhập</a>,
        // },
      ]}
    />
  );
}

function AppLayout() {
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
            <Routes>
              {adminRoutes}
              <Route path="/" element={<h1>Trang chủ</h1>} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
