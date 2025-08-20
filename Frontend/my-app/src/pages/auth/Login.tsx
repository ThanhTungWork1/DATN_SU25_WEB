import { Form, Input, Button, message } from "antd";
import { useNavigate, Link, useLocation } from "react-router-dom";
import useLogin from "../../hook/useLogin";
import "../../assets/styles/login.css";

const LoginPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect if this is admin login or user login
  // Kiểm tra xem có phải admin đang truy cập không
  const isAdminLogin =
    location.pathname.startsWith("/admin") ||
    location.state?.from?.pathname?.startsWith("/admin") ||
    // Thêm fallback: nếu URL có /admin thì coi như admin login
    window.location.pathname.includes("/admin");
  console.log("🔍 Login component - isAdminLogin:", isAdminLogin);
  console.log("🔍 Login component - current pathname:", location.pathname);
  console.log("🔍 Login component - location state:", location.state);
  console.log(
    "🔍 Login component - window.location.pathname:",
    window.location.pathname
  );

  const { mutate: login, isPending } = useLogin({
    resource: "admin/login", // Luôn sử dụng admin/login API
    forAdmin: true, // Luôn coi như admin login
  });

  const onFinish = (values: { login: string; password: string }) => {
    console.log("🚀 Bắt đầu đăng nhập với:", values);

    // Luôn gửi email field cho admin login
    const loginData = { email: values.login, password: values.password };

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

          // Luôn lưu thông tin admin
          localStorage.setItem("admin_user", JSON.stringify(data.user));
          console.log("💾 Đã lưu vào localStorage (Admin):");
          console.log("   - role:", localStorage.getItem("role"));
          console.log("   - admin_user:", localStorage.getItem("admin_user"));

          // Luôn chuyển đến admin dashboard
          console.log("👨‍💼 Admin login - Chuyển hướng đến admin dashboard");
          message.success("Đăng nhập admin thành công!");
          navigate("/admin/dashboard");
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
        <h2 className="login-title">Đăng nhập Admin</h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="login-form"
        >
          <Form.Item
            label="Email"
            name="login"
            rules={[{ required: true, message: "Vui lòng nhập email" }]}
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
              Đăng nhập Admin
            </Button>
          </Form.Item>
        </Form>
        <div className="login-footer">
          <p>
            <Link to="/login">Đăng nhập người dùng</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
