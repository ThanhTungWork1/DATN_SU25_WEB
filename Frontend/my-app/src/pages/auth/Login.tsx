import { Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { TokenManager } from "../../utils/tokenUtils";

const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 6 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 14 } },
};

export const Login = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const onFinish = async (formData: { email: string; password: string }) => {
        try {
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
            
            if (response.ok) {
                const role = data.user.role;
                
                // **FIX: Sử dụng TokenManager và phân biệt admin/user rõ ràng**
                if (role === 1) {
                    // Admin: sử dụng admin token
                    TokenManager.setToken(data.token, 'admin');
                    localStorage.setItem("role", role.toString());
                    localStorage.setItem("admin_user", JSON.stringify(data.user));
                    messageApi.success("Đăng nhập admin thành công!");
                    
                    setTimeout(() => {
                        window.location.href = `${window.location.origin}/admin/dashboard`;
                    }, 100);
                } else {
                    // User: sử dụng user token
                    TokenManager.setToken(data.token, 'user');
                    localStorage.setItem("role", role.toString());
                    localStorage.setItem("user", JSON.stringify(data.user));
                    messageApi.success("Đăng nhập người dùng thành công!");
                    
                    setTimeout(() => {
                        window.location.href = `${window.location.origin}/`;
                    }, 100);
                }
            } else {
                messageApi.error(data.message || "Đăng nhập thất bại!");
            }
        } catch (error) {
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