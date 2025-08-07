// src/pages/admin/AdminLogin.tsx
import { useState } from "react";
import axios from "axios"; // Dùng axios trực tiếp cho đăng nhập vì bạn chưa có token
import { Form, Input, Button, Card, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

// URL đăng nhập admin của Laravel
const LOGIN_URL = "http://localhost:8000/api/admin/login";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      console.log("Admin login attempt:", values);
      
      // Gửi thông tin đăng nhập đến Laravel backend
      const response = await axios.post(LOGIN_URL, {
        email: values.email,
        password: values.password,
      });

      console.log("Admin login response:", response.data);

      // Nếu đăng nhập thành công, Laravel sẽ trả về token và thông tin user
      const { token, user } = response.data as { token: string; user: any };

      // SỬA: Sử dụng TokenManager để quản lý token đồng bộ
      const { TokenManager } = await import("../../utils/tokenUtils");
      TokenManager.setToken(token, 'admin');
      localStorage.setItem("role", user.role.toString());
      localStorage.setItem("admin_user", JSON.stringify(user));

      message.success("Đăng nhập admin thành công! Chuyển hướng đến trang quản lý.");

      // Chuyển hướng đến trang dashboard admin
      setTimeout(() => {
        navigate("/admin/dashboard");
        // Backup: nếu navigate không hoạt động
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 1000);
      }, 500);
    } catch (error: any) {
      console.error("Admin login failed:", error);
      if (error.response && error.response.status === 401) {
        message.error(
          "Thông tin đăng nhập không chính xác hoặc bạn không có quyền Admin."
        );
      } else {
        message.error("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: "center" }}>
          Đăng nhập Admin
        </Title>
        <Form
          name="admin_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input placeholder="Email" type="email" autoComplete="username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password placeholder="Mật khẩu" autoComplete="current-password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: "100%" }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
