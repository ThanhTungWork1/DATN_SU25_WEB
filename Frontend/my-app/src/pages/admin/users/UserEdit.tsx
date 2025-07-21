import { Button, Form, Input, message, Radio, Select } from "antd";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { IUser } from "../../../types/users";
import { getOne, updateOne } from "../../../provider/dataProvider1";

const UserEdit = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Lấy current user từ localStorage (giả định bạn đã lưu khi đăng nhập)
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const isAdmin = currentUser.role === "admin";
  const isModerator = currentUser.role === "moderator";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getOne({ resource: "users", id: Number(id) });
        setUser(response.data);
        form.setFieldsValue(response.data);
      } catch (error) {
        messageApi.error("Không tìm thấy người dùng");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const onFinish = async (values: any) => {
    try {
      // Nếu không phải admin, không cho phép sửa email và role
      if (!isAdmin) {
        delete values.email;
        delete values.role;
      }

      await updateOne({
        resource: "users",
        id: Number(id),
        variables: values,
      });

      messageApi.success("Cập nhật người dùng thành công");
      setTimeout(() => navigate("/admin/users"), 1000);
    } catch (error: any) {
      messageApi.error("Lỗi khi cập nhật người dùng");
    }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div>
      {contextHolder}
      <div className="flex justify-between items-center py-5">
        <h1 className="font-semibold text-xl">Cập nhật người dùng</h1>
        <Button type="primary">
          <Link to="/admin/users">Quay lại</Link>
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        style={{ width: "50%", margin: "auto" }}
        onFinish={onFinish}
      >
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
          <Input type="email" disabled={!isAdmin} />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phone">
          <Input />
        </Form.Item>

        <Form.Item label="Địa chỉ" name="address">
          <Input />
        </Form.Item>

        {isAdmin && (
          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="moderator">Moderator</Select.Option>
              <Select.Option value="user">User</Select.Option>
            </Select>
          </Form.Item>
        )}

        <Form.Item label="Trạng thái" name="status">
          <Radio.Group>
            <Radio value={true}>Hoạt động</Radio>
            <Radio value={false}>Khoá</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="Đã xác thực" name="is_verified">
          <Radio.Group>
            <Radio value={true}>Có</Radio>
            <Radio value={false}>Không</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserEdit;
