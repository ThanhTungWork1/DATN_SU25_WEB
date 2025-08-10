import React, { useState } from "react";
import { Contact } from "lucide-react";
import {
  DesktopOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  InboxOutlined,
  GiftOutlined,
  BarChartOutlined,
  HomeOutlined, 
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme } from "antd";
import { Outlet, useNavigate } from "react-router-dom";

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem("Dashboard", "/admin/dashboard", <DesktopOutlined />),
  getItem("Thành viên", "/admin/users", <UserOutlined />),
  getItem("Danh mục", "/admin/categories", <AppstoreOutlined />),
  getItem("Thống kê DM", "/admin/category-statistics", <BarChartOutlined />),
  getItem("Sản phẩm", "/admin/products", <DesktopOutlined />),
  getItem("Thống kê SP", "/admin/product-statistics", <BarChartOutlined />),
  getItem("Tồn kho", "/admin/inventory", <InboxOutlined />),
  getItem("Đơn hàng", "/admin/orders", <DesktopOutlined />),
  getItem("Home Sections", "/admin/home-sections", <HomeOutlined />),
  getItem("Voucher", "/admin/voucher", <GiftOutlined />),
  getItem("Liên hệ", "/admin/contacts", <Contact />),
  getItem("Đăng xuất", "logout", <LogoutOutlined />),
];

const LayoutAdmin: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          defaultSelectedKeys={["/admin/dashboard"]}
          mode="inline"
          items={items}
          onClick={({ key }) => {
            if (key === "logout") {
              handleLogout();
            } else {
              navigate(key);
            }
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        ></Header>
        <Content style={{ margin: "0 16px" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}></Footer>
      </Layout>
    </Layout>
  );
};

export default LayoutAdmin;
