import { useEffect } from "react";
import { Button, Form, Input, Radio, DatePicker, message, Spin } from "antd";
import dayjs from "dayjs";
import useCurrentUser from "../../../hook/useCurrentUser";
import useProfile from "../../../hook/useProfile";
import type { IUser } from "../../types/users";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined } from "@ant-design/icons";

const UserProfile = () => {
  const [form] = Form.useForm();
  const { data: user, isLoading, refetch } = useCurrentUser();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token"); // hoặc user_token nếu bạn vẫn dùng key cũ
    message.success("Đăng xuất thành công!");
    navigate("/"); // hoặc điều hướng về trang chủ
  };
  const userId = user?.id?.toString() || "";

  const { mutate, isPending } = useProfile({
    resource: "users",
    id: userId,
  });

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        ...user,
        birthdate: user.birthdate ? dayjs(user.birthdate) : null,
      });
    }
  }, [user, form]);

  const onFinish = (values: any) => {
    const formattedValues = {
      ...values,
      birthdate: dayjs.isDayjs(values.birthdate)
        ? values.birthdate.format("YYYY-MM-DD")
        : null,
    };

    mutate(formattedValues, {
      onSuccess: () => {
        message.success("Cập nhật hồ sơ thành công");
        refetch();
      },
      onError: () => {
        message.error("Cập nhật thất bại");
      },
    });
  };

  if (isLoading || !user?.id) return <Spin tip="Đang tải hồ sơ..." />;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h1>Thông tin cá nhân</h1>
      <Button
        type="primary"
        danger
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        style={{ marginBottom: 24 }}
      ></Button>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          label="Họ tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Vui lòng nhập email" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phone">
          <Input />
        </Form.Item>

        <Form.Item label="Giới tính" name="gender">
          <Radio.Group>
            <Radio value="male">Nam</Radio>
            <Radio value="female">Nữ</Radio>
            <Radio value="other">Khác</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Ngày sinh" name="birthdate">
          <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserProfile;
