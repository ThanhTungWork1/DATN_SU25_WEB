import { Form, Input, Button, message } from "antd";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../../hook/useForgotPassword";
import "../../assets/styles/login.css";

// CSS để fix notification positioning
const notificationStyles = `
  .ant-message {
    top: 80px !important;
    right: 0px !important;
    z-index: 9999 !important;
    position: fixed !important;
  }
  .ant-message-notice {
    margin-bottom: 8px !important;
    max-width: 400px !important;
    width: auto !important;
  }
`;

// Inject CSS vào head
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = notificationStyles;
  document.head.appendChild(style);
}

const ForgotPassword = () => {
  const { forgotPassword, loading } = useForgotPassword();
  const [form] = Form.useForm();

  const onFinish = async (values: { email: string }) => {
    try {
      await forgotPassword({ email: values.email });
      message.success("Đã gửi link khôi phục mật khẩu đến email của bạn!");
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || "Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2 className="login-title">Quên mật khẩu</h2>
        <p style={{ textAlign: "center", marginBottom: "24px", color: "#666" }}>
          Nhập email của bạn để nhận link khôi phục mật khẩu
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
            <Input placeholder="Nhập email của bạn" autoComplete="email" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="login-button"
              block
            >
              Gửi link khôi phục
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <p>
            <Link to="/login">Quay lại đăng nhập</Link>
          </p>
          <p>
            <Link to="/register">Chưa có tài khoản? Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
