import { Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import useLogin from "../../hook/useLogin";

const formItemLayout = {
  labelCol: { xs: { span: 24 }, sm: { span: 6 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 14 } },
};

export const Login = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { mutate } = useLogin({ resource: "login" });

  const onFinish = (formData: { email: string; password: string }) => {
    mutate(
      {
        login: formData.email,
        password: formData.password,
      },
      {
        onSuccess: (user: any) => {
          // Lưu token đã được xử lý trong useLogin
          const role = user.role === "1" ? "1" : "0";
          localStorage.setItem("role", role);

          messageApi.success("Đăng nhập thành công");

          if (role === "1") {
            navigate("/admin/dashboard");
          } else {
            navigate("/profile");
          }
        },

        onError: (error: any) => {
          const msg = error?.response?.data?.message || "Đăng nhập thất bại!";
          messageApi.error(msg);
        },
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      {contextHolder}
      <h1 className="text-xl font-semibold mb-4">Đăng nhập</h1>
      <Form {...formItemLayout} onFinish={onFinish}>
        <Form.Item
          label="Email hoặc SĐT"
          name="email"
          rules={[{ required: true, message: "Vui lòng nhập email hoặc SĐT!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item label=" ">
          <Button type="primary" htmlType="submit">
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
