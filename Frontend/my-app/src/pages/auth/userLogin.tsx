import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import useLogin from "../../hook/useLogin";
import { useAuth } from "../../provider/AuthContext";

const UserLogin = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { mutate: loginUser, isPending } = useLogin({ resource: "login" });

  const onFinish = (values: { login: string; password: string }) => {
    loginUser(values, {
      onSuccess: (data: any) => {
        console.log("UserLogin success data:", data);
        
        if (data?.user?.role === 1) {
          // Admin đăng nhập qua user login -> chuyển đến admin dashboard
          localStorage.setItem("admin_token", data.token);
          localStorage.setItem("role", data.user.role.toString());
          message.success("Đăng nhập admin thành công!");
          navigate("/admin/dashboard");
        } else {
          // User thường
          localStorage.setItem("user_token", data.token);
          localStorage.setItem("role", data.user.role.toString());
          // Lưu user vào localStorage và cập nhật AuthContext để navbar hiển thị tên
          if (data?.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            try { login(data.user); } catch {}
          }
          message.success("Đăng nhập người dùng thành công!");
          // Điều hướng về trang hồ sơ để cập nhật tài khoản nếu cần
          navigate("/profile");
        }
      },
      onError: (error: any) => {
        message.error(
          error.response?.data?.message || error.message || "Đăng nhập thất bại"
        );
      },
    });
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "100px auto",
        padding: 24,
        border: "1px solid #ccc",
        borderRadius: 8,
      }}
    >
      <h2 style={{ textAlign: "center" }}>User Login</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
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
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserLogin;
