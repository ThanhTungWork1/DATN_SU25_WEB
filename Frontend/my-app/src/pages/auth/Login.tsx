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
  const { mutate } = useLogin({ resource: "users" });

  const onFinish = (formData: any) => {
    const { email, password } = formData;

    if (email === "admin@gmail.com" && password === "admin123") {
      messageApi.success("Đăng nhập thành công với tư cách Admin");
      localStorage.setItem("role", "admin");
      navigate("/admin/dashboard"); // hoặc route bạn muốn
      return;
    }

    mutate(formData, {
      onSuccess: (data: any) => {
        messageApi.success("Đăng nhập thành công");
        localStorage.setItem("role", "user");
        // Lưu userId vào localStorage nếu có
        if (data?.data?.id) {
          localStorage.setItem("userId", data.data.id.toString());
        }
        navigate("/");
      },
      onError: (error: any) => {
        messageApi.error(error?.response?.data || "Đăng nhập thất bại");
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {contextHolder}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Đăng nhập</h1>
      </div>
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

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
