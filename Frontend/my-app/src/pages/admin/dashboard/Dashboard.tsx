import { Card, Col, Row, Statistic } from "antd";
import {
  AppstoreOutlined,
  ShoppingOutlined,
  UserOutlined,
  ContactsOutlined,
} from "@ant-design/icons";

const Dashboard = () => {

  return (
    <div>
      <h1>Dashboard</h1>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Người dùng"
              value={0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sản phẩm"
              value={0}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn hàng"
              value={0}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Danh mục"
              value={0}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Liên hệ"
              value={0}
              prefix={<ContactsOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="Tăng trưởng người dùng">
            <p>Biểu đồ tăng trưởng người dùng sẽ được hiển thị ở đây</p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Biểu đồ người dùng">
            <p>Biểu đồ người dùng sẽ được hiển thị ở đây</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
