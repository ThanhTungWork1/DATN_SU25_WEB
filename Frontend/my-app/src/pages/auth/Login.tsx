import { Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";

const formItemLayout = {
  labelCol: { xs: { span: 24 }, sm: { span: 6 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 14 } },
};

export const Login = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const onFinish = async (formData: { email: string; password: string }) => {
    console.log("Form submitted with:", formData);
    
    try {
      // Thử gọi API trực tiếp
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          login: formData.email,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      console.log("Direct API response:", data);
      
      if (response.ok) {
        const role = data.user.role;
        localStorage.setItem("user_token", data.token);
        localStorage.setItem("role", role);
        
        messageApi.success("Đăng nhập thành công");
        
        console.log("Role:", role);
        console.log("Navigating to:", role === "1" ? "/admin/dashboard" : "/");
        
        // Thử chuyển hướng
        setTimeout(() => {
          const baseUrl = window.location.origin;
          if (role === "1") {
            console.log("Redirecting to admin dashboard...");
            window.location.href = `${baseUrl}/admin/dashboard`;
          } else {
            console.log("Redirecting to home page...");
            window.location.href = `${baseUrl}/`;
          }
        }, 100);
      } else {
        messageApi.error(data.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error("Direct API error:", error);
      messageApi.error("Đăng nhập thất bại!");
    }
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
          <Input autoComplete="username" />
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password autoComplete="current-password" />
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
