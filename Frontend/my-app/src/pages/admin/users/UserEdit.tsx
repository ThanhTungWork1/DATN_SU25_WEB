import React from 'react';
import { Button, Form, Input, message, Radio, Select } from "antd";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../../assets/styles/admin-responsive.css";
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
  const currentUser = JSON.parse(localStorage.getItem("admin_token") ? "{}" : localStorage.getItem("currentUser") || "{}");
  const isAdmin = currentUser.role === "1" || localStorage.getItem("role") === "1";
  const isModerator = currentUser.role === "2" || localStorage.getItem("role") === "2";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getOne({ resource: "users", id: Number(id) });
        setUser(response.data as IUser);
        form.setFieldsValue(response.data as IUser);
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
      console.error("Error updating user:", error);
      
      // Xử lý lỗi một cách an toàn
      let errorMessage = "Lỗi khi cập nhật người dùng";
      
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
          <Input autoComplete="name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Vui lòng nhập email" }]}
        >
          <Input type="email" disabled={!isAdmin} autoComplete="email" />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phone">
          <Input autoComplete="tel" />
        </Form.Item>

        <Form.Item label="Địa chỉ" name="address">
          <Input autoComplete="street-address" />
        </Form.Item>

        {isAdmin && (
          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select>
              <Select.Option value="1">Admin</Select.Option>
              <Select.Option value="2">Moderator</Select.Option>
              <Select.Option value="0">User</Select.Option>
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
