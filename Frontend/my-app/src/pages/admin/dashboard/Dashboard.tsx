import React from 'react';
import "../../../assets/styles/admin-responsive.css";
import { useDashboardOverview } from "../../../hook/dashboards/useDashboardOverview";
import { Card, Col, Row, Statistic, Spin, Button } from "antd";
import {
  AppstoreOutlined,
  ShoppingOutlined,
  UserOutlined,
  ContactsOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  StarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

// Import các components hiện có
import UserChart from "../../../components/dashboard/UserChart";
import UserGrowthCard from "../../../components/dashboard/UserGrowthCard";

// Import các components mới
import RevenueChart from "../../../components/dashboard/RevenueChart";
import OrdersStatusChart from "../../../components/dashboard/OrdersStatusChart";
import TopProductsTable from "../../../components/dashboard/TopProductsTable";
// Removed sections: RecentOrdersTable, RecentUsersTable
import RatingStatsChart from "../../../components/dashboard/RatingStatsChart";
// Removed section: RecentReviewsTable
import RevenueFilterCard from "../../../components/dashboard/RevenueFilterCard";
import { RevenueDateProvider } from "../../../contexts/RevenueDateContext";

const Dashboard: React.FC = () => {
  const { data, isLoading, refetch } = useDashboardOverview();

  const formatCurrency = (value: number) => {
    // Chỉ định dạng số, không bao gồm đơn vị tiền tệ
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <RevenueDateProvider>
      <div style={{ padding: "24px" }}>
        {/* Debug Component - Chỉ hiển thị trong development */}

        {/* Header */}
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: "bold",
                color: "#1890ff",
              }}
            >
              Dashboard Thống Kê
            </h1>
            <p style={{ margin: "8px 0 0 0", color: "#666" }}>
              Tổng quan hoạt động của hệ thống
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#52c41a" }}>
              ⚡ Real-time (10s)
            </span>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
              style={{ marginTop: "8px" }}
            >
              Làm mới
            </Button>
          </div>
        </div>

        {/* Thống kê tổng quan */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} lg={6}>
            <RevenueFilterCard />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đơn hàng hôm nay"
                value={data?.orders_today || 0}
                prefix={<ClockCircleOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Người dùng mới tháng này"
                value={data?.new_users_this_month || 0}
                prefix={<UserOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{ color: "#722ed1", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đơn hàng chờ xác nhận"
                value={data?.pending_orders || 0}
                prefix={<ShoppingOutlined style={{ color: "#faad14" }} />}
                valueStyle={{ color: "#faad14", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng sản phẩm"
                value={data?.total_products || 0}
                prefix={<AppstoreOutlined style={{ color: "#13c2c2" }} />}
                valueStyle={{ color: "#13c2c2", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng danh mục"
                value={data?.total_categories || 0}
                prefix={<AppstoreOutlined style={{ color: "#eb2f96" }} />}
                valueStyle={{ color: "#eb2f96", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng liên hệ"
                value={data?.total_contacts || 0}
                prefix={<ContactsOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{ color: "#722ed1", fontWeight: "bold" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng đánh giá"
                value={data?.total_reviews || 0}
                prefix={<StarOutlined style={{ color: "#faad14" }} />}
                valueStyle={{ color: "#faad14", fontWeight: "bold" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Thống kê chi tiết */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} lg={12}>
            <UserGrowthCard />
          </Col>
          <Col xs={24} sm={12} lg={12}>
            <Card>
              <Statistic
                title="Điểm đánh giá TB"
                value={data?.average_rating || 0}
                prefix={<StarOutlined style={{ color: "#faad14" }} />}
                valueStyle={{ color: "#faad14", fontWeight: "bold" }}
                suffix="/ 5"
              />
            </Card>
          </Col>
        </Row>

        {/* Biểu đồ và bảng */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          {/* Biểu đồ doanh thu */}
          <Col xs={24} lg={16}>
            <RevenueChart />
          </Col>
          {/* Biểu đồ trạng thái đơn hàng */}
          <Col xs={24} lg={8}>
            <OrdersStatusChart />
          </Col>
        </Row>

        {/* Bảng dữ liệu */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          {/* Top sản phẩm bán chạy */}
          <Col xs={24} lg={12}>
            <TopProductsTable />
          </Col>
          {/* Biểu đồ đánh giá theo sao (đưa lên để lấp chỗ trống) */}
          <Col xs={24} lg={12}>
            <RatingStatsChart />
          </Col>
        </Row>

        {/* Biểu đồ người dùng theo tháng (full width) */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} lg={24}>
            <UserChart />
          </Col>
        </Row>

        {/* (Đã gỡ) Người dùng mới và Đơn hàng gần đây */}

        {/* (Đã gỡ) Đánh giá gần đây */}
      </div>
    </RevenueDateProvider>
  );
};

export default Dashboard;
