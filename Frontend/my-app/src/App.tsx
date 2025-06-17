import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { adminRoutes } from "./routes/adminRoutes";
import "antd/dist/reset.css";
import { Layout, Menu } from "antd";

const { Header, Content, Sider } = Layout;

function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider breakpoint="lg" collapsedWidth="0">
          <div style={{ color: "white", padding: 20, fontSize: 18 }}>Admin Panel</div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
            <Menu.Item key="1">
              <a href="/admin/products">Sản phẩm</a>
            </Menu.Item>
            <Menu.Item key="2">
              <a href="/admin/orders">Đơn hàng</a>
            </Menu.Item>
            <Menu.Item key="3">
              <a href="/login">Đăng nhập</a>
            </Menu.Item>
          </Menu>
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
    </BrowserRouter>
  );
}

export default App;
