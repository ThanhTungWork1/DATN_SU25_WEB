import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import useLogin from "../../hook/useLogin";
import { TokenManager } from "../../utils/tokenUtils";

const UserLogin = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutate: loginUser, isPending } = useLogin({ resource: "login" });

  const onFinish = (values: { login: string; password: string }) => {
    loginUser(values, {
      onSuccess: (data: any) => {
        // SỬA: User login chỉ dành cho user thường (role !== 1)
        // Admin phải đăng nhập qua /admin/login
        if (data?.user?.role === 1) {
          message.warning("Tài khoản admin vui lòng đăng nhập tại trang Admin!");
          TokenManager.clearAllTokens(); // Xóa token để đảm bảo clean
          navigate("/admin/login");
          return;
        }
        
        // Chỉ user thường (role = 0 hoặc role = 2) mới được đăng nhập ở đây
        TokenManager.setToken(data.token, 'user');
        localStorage.setItem("role", data.user.role.toString());
        localStorage.setItem("user", JSON.stringify(data.user));
        message.success("Đăng nhập người dùng thành công!");
        
        // Log để debug
        console.log("User login successful:", {
          name: data.user.name,
          email: data.user.email,
          role: data.user.role
        });
        
        navigate("/");
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
