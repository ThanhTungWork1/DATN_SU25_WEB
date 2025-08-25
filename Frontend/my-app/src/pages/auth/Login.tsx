import React, { useState } from "react";
import { Form, Input, Button, message, Card } from "antd";
import "../../assets/styles/responsive.css";
import { useNavigate, Link, useLocation } from "react-router-dom";
import useLogin from "../../hook/useLogin";
import "../../assets/styles/login.css";

const LoginPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  // Sử dụng 1 API login duy nhất cho cả admin và user
  const { mutate: login, isPending } = useLogin({
    resource: "login",
    forAdmin: false, // Không phân biệt admin/user ở đây
  });

  const onFinish = (values: { login: string; password: string }) => {
    console.log("🚀 Bắt đầu đăng nhập với:", values);

    // Gửi data cho API login chung
    const loginData = { login: values.login, password: values.password };

    console.log("🚀 Data sẽ gửi đi:", loginData);

    login(loginData as any, {
      onSuccess: (data: any) => {
        console.log("✅ Login success data:", data);
        console.log("👤 User data:", data?.user);
        console.log("🔑 Token:", data?.token);
        console.log("🎭 Role:", data?.user?.role);

        try {
          // Token đã được lưu trong useLogin hook, chỉ cần lưu thông tin user
          localStorage.setItem("role", data.user.role.toString());

          // Lưu thông tin user
          localStorage.setItem("user", JSON.stringify(data.user));
          console.log("💾 Đã lưu vào localStorage:");
          console.log("   - role:", localStorage.getItem("role"));
          console.log("   - user:", localStorage.getItem("user"));

          // Phân biệt role để redirect
          const userRole = data.user.role;
          console.log("🎭 User role:", userRole);

          if (userRole === 1) {
            // Admin - chuyển đến admin dashboard
            console.log("👨‍💼 Admin login - Chuyển hướng đến admin dashboard");
            message.success("Đăng nhập admin thành công!");
            navigate("/admin/dashboard");
          } else {
            // User thường - chuyển đến client dashboard
            console.log("👤 User login - Chuyển hướng đến client dashboard");
            message.success("Đăng nhập thành công!");
            navigate("/");
          }
        } catch (error) {
          console.error("❌ Lỗi khi lưu localStorage:", error);
          message.error("Lỗi khi lưu thông tin đăng nhập");
        }
      },
      onError: (error: any) => {
        console.error("❌ Login error:", error);
        console.error("❌ Error response:", error.response);
        console.error("❌ Error data:", error.response?.data);
        console.error("❌ Error message:", error.message);

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Đăng nhập thất bại";
        console.error("❌ Final error message:", errorMessage);

        message.error(errorMessage);
      },
    });
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2 className="login-title">Đăng nhập</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="login-form"
        >
          <Form.Item
            label="Email/Số điện thoại"
            name="login"
            rules={[
              { required: true, message: "Vui lòng nhập thông tin đăng nhập" },
            ]}
          >
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              className="login-button"
              block
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
        <div className="login-footer">
          <p>
            <Link to="/register">Đăng ký tài khoản mới</Link>
          </p>
          <p>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
