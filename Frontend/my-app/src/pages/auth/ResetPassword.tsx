import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Card } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForgotPassword } from "../../hook/useForgotPassword";
import "../../assets/styles/login.css";

const ResetPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword, loading } = useForgotPassword();

  const [token, setToken] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    // Lấy token và email từ URL params
    const tokenParam = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(emailParam);

      // Pre-fill email field
      form.setFieldsValue({ email: emailParam });

      console.log("🔐 Reset Password - URL params:", {
        token: tokenParam,
        email: emailParam,
      });
    } else {
      message.error("Link khôi phục mật khẩu không hợp lệ!");
      navigate("/forgot-password");
    }
  }, [searchParams, form, navigate]);

  const onFinish = async (values: {
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    try {
      console.log("🔐 Reset Password - Submitting:", {
        email: values.email,
        token: token,
        has_password: !!values.password,
        has_confirmation: !!values.password_confirmation,
      });

      await resetPassword({
        email: values.email,
        token: token,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });

      message.success(
        "Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới."
      );
      
      // Đóng tab hiện tại và chuyển về tab gốc
      if (window.opener) {
        // Nếu có tab gốc, chuyển focus về tab gốc và đóng tab hiện tại
        window.opener.focus();
        window.close();
      } else {
        // Nếu không có tab gốc (mở trực tiếp), chuyển về trang login
        navigate("/login");
      }
    } catch (error: any) {
      console.error("❌ Reset Password error:", error);
      message.error(
        error.message || "Đặt lại mật khẩu thất bại, vui lòng thử lại!"
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2 className="login-title">Đặt lại mật khẩu</h2>
        <p style={{ textAlign: "center", marginBottom: "24px", color: "#666" }}>
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="login-form"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input
              placeholder="Nhập email của bạn"
              autoComplete="email"
              disabled // Disable vì đã pre-fill từ URL
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
            ]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu mới"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="password_confirmation"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="login-button"
              block
            >
              Đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <p>
            <a href="/login">Quay lại đăng nhập</a>
          </p>
          <p>
            <a href="/forgot-password">Gửi lại link khôi phục</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

