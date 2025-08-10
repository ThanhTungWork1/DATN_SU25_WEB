// src/layouts/admin/AdminLayout.tsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  GiftOutlined,
  CommentOutlined,
  LogoutOutlined,
  PictureOutlined,
  ContactsOutlined,
} from "@ant-design/icons";

const { Header, Content, Sider } = Layout;

// --- Định nghĩa SidebarMenu ---
function SidebarMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Logic để highlight đúng menu item
  const selectedKey =
    path.startsWith("/admin/dashboard") || path === "/admin" ? "0"
    : path.startsWith("/admin/products") ? "1"
    : path.startsWith("/admin/orders") ? "2"
    : path.startsWith("/admin/categories") ? "3"
    : path.startsWith("/admin/banners") ? "4"
    : path.startsWith("/admin/comments") ? "5"
    : path.startsWith("/admin/users") ? "6"
    : path.startsWith("/admin/inventory") ? "7"
    : path.startsWith("/admin/vouchers") || path.startsWith("/admin/voucher") ? "8"
    : path.startsWith("/admin/contacts") ? "9"
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
        navigate("/admin/banners");
        break;
      case "5":
        navigate("/admin/comments");
        break;
      case "6":
        navigate("/admin/users");
        break;
      case "7":
        navigate("/admin/inventory");
        break;
      case "8":
        navigate("/admin/vouchers");
        break;
      case "9":
        navigate("/admin/contacts");
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
          icon: <DashboardOutlined />,
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
        {
          key: "3",
          icon: <AppstoreOutlined />,
          label: "Danh mục",
        },
        {
          key: "4",
          icon: <PictureOutlined />,
          label: "Banner",
        },
        {
          key: "5",
          icon: <CommentOutlined />,
          label: "Đánh giá",
        },
        {
          key: "6",
          icon: <UserOutlined />,
          label: "Thành viên",
        },
        {
          key: "7",
          icon: <InboxOutlined />,
          label: "Tồn kho",
        },
        {
          key: "8",
          icon: <GiftOutlined />,
          label: "Voucher",
        },
        {
          key: "9",
          icon: <ContactsOutlined />,
          label: "Liên hệ",
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
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
