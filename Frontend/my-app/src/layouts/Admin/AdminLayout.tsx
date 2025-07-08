// src/layouts/admin/AdminLayout.tsx

import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom"; 
import { Layout, Menu } from "antd";
import { ShoppingOutlined, ShoppingCartOutlined, LogoutOutlined } from "@ant-design/icons";
import logo from "../../assets/logo.png"; 

const { Header, Content, Sider } = Layout;

// Component SidebarMenu 
function SidebarMenu() {
  const location = useLocation();
  const navigate = useNavigate(); // Dùng useNavigate để điều hướng 

  // Lấy key tương ứng với URL hiện tại
  const selectedKey =
    location.pathname.startsWith("/admin/products") ? "1"
    : location.pathname.startsWith("/admin/orders") ? "2"
    : ""; 

  const handleMenuClick = (key: string, path: string) => {
    if (key === "logout") {
      // Thực hiện logout (xóa token, chuyển hướng về trang login)
      console.log("Đăng xuất");
      navigate("/login"); // Chuyển hướng về trang đăng nhập
    } else {
      navigate(path);
    }
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      items={[
        {
          key: "1",
          icon: <ShoppingOutlined />,
          label: "Sản phẩm",
          onClick: () => handleMenuClick("1", "/admin/products"), // Xử lý click bằng navigate
        },
        {
          key: "2",
          icon: <ShoppingCartOutlined />,
          label: "Đơn hàng",
          onClick: () => handleMenuClick("2", "/admin/orders"),
        },
      ]}
    />
  );
}

// Component AdminLayout chính
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
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}