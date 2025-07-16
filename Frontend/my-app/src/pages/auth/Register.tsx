import { Button, Form, Input, message, Radio } from "antd";
import { useNavigate } from "react-router-dom";
import useRegister from "../../hook/useRegister";
import useLogin from "../../hook/useLogin";

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

export const Register = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { mutate: registerMutate } = useRegister({ resource: "register" });
  const { mutate: loginMutate } = useLogin({ resource: "login" });

  const onFinish = (formData: any) => {
  const {
    confirm, // lấy confirm ra nhưng không gửi
    gender,  // nếu backend không yêu cầu gender, có thể bỏ
    ...rest
  } = formData;

  const submitData = {
    ...rest,
    password_confirmation: confirm, // Laravel expects this!
  };

  registerMutate(submitData, {
    onSuccess: () => {
      loginMutate(
        { login: submitData.email, password: submitData.password }, // dùng "login" để backend xử lý email/phone
        {
          onSuccess: (data) => {
            const res: any = data;
            if (res && res.token) {
              localStorage.setItem("token", res.token);
            }
            messageApi.success("Đăng ký & đăng nhập thành công!");
            navigate("/");
          },
          onError: () => {
            messageApi.error("Đăng ký thành công, nhưng đăng nhập thất bại!");
            navigate("/login");
          },
        }
      );
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
    <div className="max-w-3xl mx-auto">
      {contextHolder}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Đăng ký</h1>
      </div>
      <Form {...formItemLayout} onFinish={onFinish}>
        <Form.Item
          label="Họ tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
        >
          <Input />
        </Form.Item>

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
          label="Số điện thoại"
          name="phone"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
        >
          <Input />
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
          <Input.Password />
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
          <Input.Password />
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
