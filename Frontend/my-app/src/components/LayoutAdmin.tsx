import React, { useState, useEffect } from "react";
import {
  DesktopOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  InboxOutlined,
  GiftOutlined,
  BarChartOutlined,
  HomeOutlined,
  PictureOutlined,
  CommentOutlined,
  MessageOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { TokenManager } from "../utils/tokenUtils";
import { RevenueDateProvider } from "../contexts/RevenueDateContext";

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
  getItem("Danh mục", "categories", <AppstoreOutlined />, [
    getItem("Danh sách danh mục", "/admin/categories", <AppstoreOutlined />),
    getItem(
      "Thống kê danh mục",
      "/admin/category-statistics",
      <BarChartOutlined />
    ),
  ]),
  getItem("Sản phẩm", "products", <DesktopOutlined />, [
    getItem("Danh sách sản phẩm", "/admin/products", <DesktopOutlined />),
    getItem(
      "Thống kê sản phẩm",
      "/admin/product-statistics",
      <BarChartOutlined />
    ),
  ]),
  getItem("Tồn kho", "/admin/inventory", <InboxOutlined />),
  getItem("Đơn hàng", "/admin/orders", <DesktopOutlined />),
  getItem("Home Sections", "/admin/home-sections", <HomeOutlined />),
  getItem("Voucher", "/admin/voucher", <GiftOutlined />),
  getItem("Banners", "/admin/banners", <PictureOutlined />),
  getItem("Comments", "/admin/comments", <CommentOutlined />),
  getItem("Quản lý liên hệ", "/admin/contacts", <MessageOutlined />),
  getItem("Quản lý Hoàn tiền", "/admin/refund-requests", <SolutionOutlined />),
  getItem("Đăng xuất", "logout", <LogoutOutlined />),
];

const LayoutAdmin: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Add admin-page class to body when component mounts
  useEffect(() => {
    document.body.classList.add("admin-page");

    // Remove class when component unmounts
    return () => {
      document.body.classList.remove("admin-page");
    };
  }, []);

  const handleLogout = () => {
    TokenManager.clearAdminToken();
    navigate("/login");
  };

  return (
    <Layout
      style={{ minHeight: "100vh" }}
      data-admin="true"
      className="admin-layout"
    >
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
            <RevenueDateProvider>
              <Outlet />
            </RevenueDateProvider>
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}></Footer>
      </Layout>
    </Layout>
  );
};

export default LayoutAdmin;
