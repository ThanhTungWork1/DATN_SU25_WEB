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
    // Nếu đăng nhập admin "ảo"
    if (formData.email === "admin@gmail.com" && formData.password === "admin123") {
      localStorage.setItem("role", "admin");
      messageApi.success("Đăng nhập với tư cách Admin");
      navigate("/admin/dashboard");
      return;
    }

    // Nếu là user bình thường => gọi API Laravel
    mutate(formData, {
      onSuccess: (data: any) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "user");
        messageApi.success("Đăng nhập thành công");
        navigate("/");
      },
      onError: (error: any) => {
        messageApi.error(error.message || "Đăng nhập thất bại");
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {contextHolder}
      <h1 className="text-xl font-semibold mb-4">Đăng nhập</h1>
      <Form {...formItemLayout} onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
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