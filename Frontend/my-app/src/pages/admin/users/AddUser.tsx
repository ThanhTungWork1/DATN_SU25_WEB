
import { Button, Form, Input, Select, Switch, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import useCreate from "../../../hook/users/UseCreate";
const { Option } = Select;

export const UserAdd = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const navigate = useNavigate();
    const { mutate } = useCreate({ resource: "users" });

    const onFinish = (formData: any) => {
        const now = new Date().toISOString();
        const dataWithTimestamps = {
            ...formData,
            created_at: now,
            updated_at: now,
        };

        mutate(dataWithTimestamps, {
            onSuccess: () => {
                messageApi.success("Thêm người dùng thành công");
                setTimeout(() => navigate("/admin/users"), 1000);
            },
            onError: (error: any) => {
                messageApi.error(error?.response?.data || "Lỗi khi thêm người dùng");
            },
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center py-5">
                <h1 className="font-semibold text-xl">Thêm người dùng</h1>
                <Button type="primary">
                    <Link to="/admin/users">Quay lại</Link>
                </Button>
            </div>

            <Form layout="vertical" onFinish={onFinish} style={{ width: "50%", margin: "auto" }}>
                <Form.Item
                    label="Tên người dùng"
                    name="name"
                    rules={[{ required: true, message: "Tên không được để trống" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: "Email không được để trống" },
                        { type: "email", message: "Email không hợp lệ" },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true, message: "Mật khẩu không được để trống" }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item label="Số điện thoại" name="phone">
                    <Input />
                </Form.Item>

                <Form.Item label="Địa chỉ" name="address">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item
                    label="Vai trò"
                    name="role"
                    rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
                >
                    <Select placeholder="Chọn vai trò">
                        <Option value="admin">Admin</Option>
                        <Option value="moderator">Moderator</Option>
                        <Option value="user">User</Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Trạng thái" name="status" valuePropName="checked">
                    <Switch checkedChildren="Hoạt động" unCheckedChildren="Khoá" />
                </Form.Item>

                <Form.Item label="Đã xác minh" name="is_verified" valuePropName="checked">
                    <Switch checkedChildren="Đã xác minh" unCheckedChildren="Chưa xác minh" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Lưu
                    </Button>
                </Form.Item>
            </Form>
            {contextHolder}
        </div>
    );
};

export default UserAdd;
