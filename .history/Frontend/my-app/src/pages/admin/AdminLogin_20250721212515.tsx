// src/pages/admin/AdminLogin.tsx

import React, { useState } from "react";
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
      // Gửi thông tin đăng nhập đến Laravel backend
      const response = await axios.post(LOGIN_URL, {
        email: values.email,
        password: values.password,
      });

      // Nếu đăng nhập thành công, Laravel sẽ trả về token và thông tin user
      const token = response.data.token;

      // Lưu token vào localStorage (để axiosInstance có thể sử dụng)
      localStorage.setItem("authToken", token);

      message.success("Đăng nhập thành công! Chuyển hướng đến trang quản lý.");

      // Chuyển hướng đến trang sản phẩm admin
      navigate("/admin/products");
    } catch (error: any) {
      console.error("Login failed:", error);
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
            <Input placeholder="Email" type="email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password placeholder="Mật khẩu" />
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
