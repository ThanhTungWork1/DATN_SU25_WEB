import React, { useState, useEffect } from "react";
import { Button, Form, Input, message, Spin } from "antd";
import useCurrentUser from "../../../hook/useCurrentUser";
import { useNavigate } from "react-router-dom";
import "../../../assets/styles/responsive.css";
import { LogoutOutlined, ShoppingOutlined, KeyOutlined } from "@ant-design/icons";
import { TokenManager } from "../../../utils/tokenUtils";
import "../../../layouts/Client/UserProfile.css";
import useProfile from "../../../hook/useProfile";
import { useChangePassword } from "../../../hook/useChangePassword"; // ✅ hook đổi mật khẩu

const UserProfile = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const { data: user, isLoading, refetch } = useCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    TokenManager.clearAllTokens();
    message.success("Đăng xuất thành công!");
    navigate("/");
    window.location.reload();
  };

  const { mutate, isPending } = useProfile();
  const { changePassword, loading: changingPassword } = useChangePassword();

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    }
  }, [user, form]);

  // ✅ cập nhật hồ sơ
  const onFinishProfile = (values: any) => {
    mutate(values, {
      onSuccess: () => {
        message.success("Cập nhật hồ sơ thành công");
        refetch();
      },
      onError: () => {
        message.error("Cập nhật thất bại");
      },
    });
  };

  // ✅ đổi mật khẩu
  const onFinishPassword = async (values: any) => {
    const success = await changePassword(
      values.current_password,
      values.new_password,
      values.new_password_confirmation
    );
    if (success) {
      passwordForm.resetFields();
      setShowChangePasswordForm(false); // Ẩn form sau khi đổi mật khẩu thành công
    }
  };

  // ✅ toggle hiển thị form đổi mật khẩu
  const handleTogglePasswordForm = () => {
    setShowChangePasswordForm(!showChangePasswordForm);
    if (!showChangePasswordForm) {
      passwordForm.resetFields(); // Reset form khi mở
    }
  };

  if (isLoading || !user?.id)
    return (
      <div className="profile-loading">
        <Spin size="large" tip="Đang tải hồ sơ..." />
      </div>
    );

  return (
    <div className="user-profile-container">
      {/* Header Section */}
      <div className="user-profile-header">
        <h1 className="user-profile-title">Thông tin cá nhân</h1>
        <p className="user-profile-subtitle">
          Quản lý thông tin tài khoản của bạn
        </p>
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <h3 className="quick-actions-title">Thao tác nhanh</h3>
        <div className="quick-actions-grid">
          <button
            className="quick-action-btn success"
            onClick={() => navigate("/orders")}
          >
            <ShoppingOutlined />
            Lịch sử đơn hàng
          </button>
        </div>
      </div>

      {/* Profile Form Section */}
      <div className="profile-form-section">
        <h3 className="profile-form-title">Thông tin cá nhân</h3>
        <Form
          form={form}
          onFinish={onFinishProfile}
          layout="vertical"
          className="profile-form"
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
            <Input autoComplete="email" />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone">
            <Input autoComplete="tel" />
          </Form.Item>

          {/* Nút đổi mật khẩu */}
          <Form.Item>
            <Button
              type="default"
              icon={<KeyOutlined />}
              onClick={handleTogglePasswordForm}
              style={{ marginBottom: "16px" }}
            >
              {showChangePasswordForm ? "Đóng đổi mật khẩu" : "Đổi mật khẩu"}
            </Button>
          </Form.Item>

          <Form.Item>
            <div className="profile-form-actions">
              <Button type="primary" htmlType="submit" loading={isPending}>
                Cập nhật thông tin
              </Button>
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>

      {/* Change Password Section - Chỉ hiện khi showChangePasswordForm = true */}
      {showChangePasswordForm && (
        <div className="profile-form-section">
          <h3 className="profile-form-title">Đổi mật khẩu</h3>
          <Form
            form={passwordForm}
            onFinish={onFinishPassword}
            layout="vertical"
            className="profile-form"
          >
            <Form.Item
              label="Mật khẩu hiện tại"
              name="current_password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="new_password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="new_password_confirmation"
              dependencies={["new_password"]}
              rules={[
                { required: true, message: "Vui lòng nhập lại mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("new_password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp")
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={changingPassword}
              >
                Đổi mật khẩu
              </Button>
              <Button
                type="default"
                onClick={() => setShowChangePasswordForm(false)}
              >
                Hủy
              </Button>
            </div>
          </Form>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
