import { Button, Form, Input, Select, Switch, message } from "antd";
import React from 'react';
import { useNavigate, Link } from "react-router-dom";
import "../../../assets/styles/admin-responsive.css";
import useCreate from "../../../hook/users/UseCreate";
const { Option } = Select;

export const UserAdd = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const { mutate } = useCreate({ resource: "users" });

  const onFinish = (formData: any) => {
    // Loại bỏ created_at và updated_at vì backend sẽ tự động xử lý
    const { created_at, updated_at, ...cleanFormData } = formData;

    console.log("Form data being sent:", cleanFormData);

    mutate(cleanFormData, {
      onSuccess: () => {
        messageApi.success("Thêm người dùng thành công");
        setTimeout(() => navigate("/admin/users"), 1000);
      },
      onError: (error: any) => {
        console.error("Error creating user:", error);
        
        // Xử lý lỗi một cách an toàn
        let errorMessage = "Lỗi khi thêm người dùng";
        
        if (error?.response?.data) {
          const errorData = error.response.data;
          
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          } else if (errorData?.errors) {
            // Xử lý validation errors
            const errorList = Object.values(errorData.errors).flat();
            errorMessage = Array.isArray(errorList) ? errorList[0] : errorMessage;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        messageApi.error(errorMessage);
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

      <Form
        layout="vertical"
        onFinish={onFinish}
        style={{ width: "50%", margin: "auto" }}
      >
        <Form.Item
          label="Tên người dùng"
          name="name"
          rules={[{ required: true, message: "Tên không được để trống" }]}
        >
          <Input autoComplete="name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Email không được để trống" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input autoComplete="email" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Mật khẩu không được để trống" }]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phone">
          <Input autoComplete="tel" />
        </Form.Item>

        <Form.Item label="Địa chỉ" name="address">
          <Input.TextArea rows={3} autoComplete="street-address" />
        </Form.Item>

        <Form.Item
          label="Vai trò"
          name="role"
          rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
        >
          <Select placeholder="Chọn vai trò">
            <Option value="1">Admin</Option>
            <Option value="2">Moderator</Option>
            <Option value="0">User</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Trạng thái" name="status" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Khoá" />
        </Form.Item>

        <Form.Item
          label="Đã xác minh"
          name="is_verified"
          valuePropName="checked"
        >
          <Switch
            checkedChildren="Đã xác minh"
            unCheckedChildren="Chưa xác minh"
          />
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
