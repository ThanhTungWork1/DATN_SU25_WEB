import { useDashboardStats } from "../../../hook/dashboards/useDashboardStats";
import { Card, Col, Row, Statistic } from "antd";
import {
  AppstoreOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";

import UserChart from "../../../components/dashboard/UserChart";
import UserGrowthCard from "../../../components/dashboard/UserGrowthCard";
import { Contact } from "lucide-react";

const Dashboard = () => {
  const { data, isLoading } = useDashboardStats();

  if (isLoading) return <p>Loading...</p>;

  return (
    <Row gutter={[16, 16]}>
      <Col span={6}>
        <Card>
          <Statistic
            title="Người dùng"
            value={data?.users}
            prefix={<UserOutlined />}
          />
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <UserGrowthCard />
            </Col>
          </Row>
          <UserChart />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Sản phẩm"
            value={data?.products}
            prefix={<AppstoreOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Đơn hàng"
            value={data?.orders}
            prefix={<ShoppingOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic
            title="Liên hệ"
            value={data?.contact}
            prefix={<Contact />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default Dashboard;
