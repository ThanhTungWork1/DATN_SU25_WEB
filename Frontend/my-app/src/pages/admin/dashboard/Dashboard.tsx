import React from "react";
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
import RecentOrdersTable from "../../../components/dashboard/RecentOrdersTable";
import RecentUsersTable from "../../../components/dashboard/RecentUsersTable";
import RatingStatsChart from "../../../components/dashboard/RatingStatsChart";
import RecentReviewsTable from "../../../components/dashboard/RecentReviewsTable";
import LowStockAlert from "../../../components/dashboard/LowStockAlert";

const Dashboard: React.FC = () => {
  const { data, isLoading, refetch } = useDashboardOverview();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    })
      .format(value)
      .replace("₫", " VND");
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
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={data?.total_revenue || 0}
              prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
              formatter={(value) => formatCurrency(value as number)}
            />
          </Card>
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
        {/* Báo hàng tồn kho */}
        <Col xs={24} lg={12}>
          <LowStockAlert />
        </Col>
      </Row>

      {/* Thống kê đánh giá và biểu đồ người dùng */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        {/* Thống kê đánh giá theo sao */}
        <Col xs={24} lg={12}>
          <RatingStatsChart />
        </Col>
        {/* Biểu đồ người dùng theo tháng */}
        <Col xs={24} lg={12}>
          <UserChart />
        </Col>
      </Row>

      {/* Người dùng mới và đơn hàng gần đây */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        {/* Người dùng mới nhất */}
        <Col xs={24} lg={12}>
          <RecentUsersTable />
        </Col>
        {/* Đơn hàng gần đây */}
        <Col xs={24} lg={12}>
          <RecentOrdersTable />
        </Col>
      </Row>

      {/* Đánh giá gần đây - di chuyển xuống dưới cùng */}
      <Row gutter={[16, 16]}>
        {/* Đánh giá gần đây */}
        <Col xs={24} lg={12}>
          <RecentReviewsTable />
        </Col>
        {/* Để trống để cân đối */}
        <Col xs={24} lg={12}>
          <div style={{ height: "100%" }}></div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;