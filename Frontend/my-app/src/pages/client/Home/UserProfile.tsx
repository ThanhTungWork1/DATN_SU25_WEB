import React, { useState, useEffect } from 'react';
import { Button, Form, Input, message, Spin } from "antd";
import useCurrentUser from "../../../hook/useCurrentUser";
import { useNavigate } from 'react-router-dom';
import "../../../assets/styles/responsive.css";
import { LogoutOutlined, ShoppingOutlined } from "@ant-design/icons";
import { TokenManager } from "../../../utils/tokenUtils";
import "../../../layouts/Client/UserProfile.css";
import useProfile from "../../../hook/useProfile";

const UserProfile = () => {
  const [form] = Form.useForm();
  const { data: user, isLoading, refetch } = useCurrentUser();
  const navigate = useNavigate();
  const handleLogout = () => {
    TokenManager.clearAllTokens();
    message.success("Đăng xuất thành công!");
    navigate("/");
    window.location.reload();
  };

  const { mutate, isPending } = useProfile();

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    }
  }, [user, form]);

  const onFinish = (values: any) => {
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
          onFinish={onFinish}
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
    </div>
  );
};

export default UserProfile;
