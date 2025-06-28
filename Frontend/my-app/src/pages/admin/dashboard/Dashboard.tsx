import React from 'react'
import { useDashboardStats } from '../../../hook/dashboards/useDashboardStats'
import { Card, Col, Row, Statistic } from 'antd';
import { AppstoreOutlined, ShoppingOutlined } from '@ant-design/icons';
import UserGrowthCard from '../../../components/dashboard/UserGrowthCard';

const Dashboard = () => {

  const { data, isLoading } = useDashboardStats();

  if (isLoading) return <p>Loading...</p>

  return (
    <Row gutter={[16, 16]}>
      <Col span={6}>
        <UserGrowthCard />
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
    </Row>
  )
}

export default Dashboard