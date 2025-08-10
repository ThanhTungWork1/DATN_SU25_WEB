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

const Dashboard = () => {
  const { data, isLoading, refetch } = useDashboardOverview();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Dashboard</h1>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sản phẩm"
              value={data?.products || 0}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn hàng"
              value={data?.orders || 0}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Người dùng"
              value={data?.users || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Liên hệ"
              value={data?.contacts || 0}
              prefix={<ContactsOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={data?.revenue || 0}
              prefix={<DollarOutlined />}
              suffix="VND"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Đơn hàng hôm nay"
              value={data?.todayOrders || 0}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Đánh giá trung bình"
              value={data?.averageRating || 0}
              prefix={<StarOutlined />}
              precision={1}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;