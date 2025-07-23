import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import useLogin from "../../hook/useLogin";

const AdminLogin = () => {
  console.log("AdminLogin component rendered");
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutate: loginAdmin, isPending } = useLogin({ resource: "login" });

  const onFinish = (values: { login: string; password: string }) => {
    loginAdmin(values, {
      onSuccess: (data: any) => {
        if (data?.user?.role == 1) {
          localStorage.setItem("admin_token", data.token);
          message.success("Đăng nhập admin thành công!");
          navigate("/admin/dashboard");
        } else {
          message.error("❌ Bạn không có quyền truy cập admin.");
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
      <h2 style={{ textAlign: "center" }}>Admin Login</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="login"
          rules={[{ required: true, message: "Vui lòng nhập email" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
        >
          <Input.Password />
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

export default AdminLogin;
