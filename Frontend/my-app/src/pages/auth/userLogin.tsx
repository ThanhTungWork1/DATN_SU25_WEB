import React from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import useLogin from "../../hook/useLogin";

const UserLogin = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutate: loginUser, isPending } = useLogin({ resource: "login" });

  const onFinish = (values: { login: string; password: string }) => {
    loginUser(values, {
      onSuccess: (data: any) => {
        if (data?.user?.role !== "1") {
          localStorage.setItem("token", data.token); // thay vì "user_token"
          message.success("Đăng nhập người dùng thành công!");
          navigate("/profile");
        } else {
          message.error("Tài khoản admin không được dùng ở đây!");
        }
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || error.message || "Đăng nhập thất bại");
      },
    });
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2 style={{ textAlign: "center" }}>User Login</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Email" name="login" rules={[{ required: true, message: "Vui lòng nhập email" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
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

export default UserLogin;
