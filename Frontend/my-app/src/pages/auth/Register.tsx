import { Button, Form, Input, message, Radio } from "antd";
import { useNavigate, Link } from "react-router-dom";
import useRegister from "../../hook/useRegister";
import useLogin from "../../hook/useLogin";
import { TokenManager } from "../../utils/tokenUtils";
import { useState } from "react";
import "../../assets/styles/register.css";

export const Register = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { mutate: registerMutate } = useRegister({ resource: "register" });
  const { mutate: loginMutate } = useLogin({ resource: "login" });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>(
    {}
  );

  const onFinish = (formData: any) => {
    const {
      confirm, // lấy confirm ra nhưng không gửi
      gender, // nếu backend không yêu cầu gender, có thể bỏ
      ...rest
    } = formData;

    const submitData = {
      ...rest,
      password_confirmation: confirm, // Laravel expects this!
    };

    registerMutate(submitData, {
      onSuccess: (data: any) => {
        // **FIX: Sử dụng token từ response đăng ký luôn, không cần đăng nhập lại**
        if (data && data.token) {
          TokenManager.setToken(data.token, "user");
          localStorage.setItem("role", data.user.role.toString());
          localStorage.setItem("user", JSON.stringify(data.user));
          messageApi.success(
            "Đăng ký thành công! Chào mừng bạn đến với StrideX!"
          );
          navigate("/");
        } else {
          // Fallback: nếu không có token trong response, thử đăng nhập
          loginMutate(
            { login: submitData.email, password: submitData.password },
            {
              onSuccess: (loginData: any) => {
                TokenManager.setToken(loginData.token, "user");
                localStorage.setItem("role", loginData.user.role.toString());
                localStorage.setItem("user", JSON.stringify(loginData.user));
                messageApi.success("Đăng ký & đăng nhập thành công!");
                navigate("/");
              },
              onError: () => {
                messageApi.error(
                  "Đăng ký thành công, nhưng đăng nhập thất bại!"
                );
                navigate("/login");
              },
            }
          );
        }
      },
      onError: (error: any) => {
        const res = error?.response?.data;
        if (typeof res === "string") {
          messageApi.error(res);
        } else if (res?.message) {
          messageApi.error(res.message);
        } else if (res?.errors) {
          const errorList = Object.values(res.errors).flat();
          // messageApi.error(errorList[0] || "Đăng ký thất bại");
        } else {
          messageApi.error("Đăng ký thất bại");
        }
      },
    });
  };

  return (
    <div className="register-container">
      {contextHolder}
      <div className="register-form-container">
        <h2 className="register-title">Đăng ký</h2>
        <Form layout="vertical" onFinish={onFinish} className="register-form">
          <Form.Item
            label="Họ tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            validateStatus={fieldErrors.name ? "error" : undefined}
            help={fieldErrors.name ? fieldErrors.name[0] : undefined}
          >
            <Input autoComplete="name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
            validateStatus={fieldErrors.email ? "error" : undefined}
            help={fieldErrors.email ? fieldErrors.email[0] : undefined}
          >
            <Input autoComplete="email" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
            validateStatus={fieldErrors.phone ? "error" : undefined}
            help={fieldErrors.phone ? fieldErrors.phone[0] : undefined}
          >
            <Input autoComplete="tel" />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            validateStatus={fieldErrors.address ? "error" : undefined}
            help={fieldErrors.address ? fieldErrors.address[0] : undefined}
          >
            <Input autoComplete="street-address" />
          </Form.Item>

          <Form.Item
            label="Giới tính"
            name="gender"
            initialValue="male"
            rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
          >
            <Radio.Group>
              <Radio value="male">Nam</Radio>
              <Radio value="female">Nữ</Radio>
              <Radio value="other">Khác</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            label="Nhập lại mật khẩu"
            name="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="register-button"
              block
            >
              Đăng ký
            </Button>
          </Form.Item>
        </Form>
        <div className="register-footer">
          <p>
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
