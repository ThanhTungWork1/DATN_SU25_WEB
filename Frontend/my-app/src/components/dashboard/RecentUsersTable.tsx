import React from 'react';
import { Card, Table, Spin, Avatar } from 'antd';
import { useRecentUsers } from '../../hook/dashboards/useRecentUsers';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const RecentUsersTable: React.FC = () => {
  const { data, isLoading } = useRecentUsers(10);

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'name',
      key: 'avatar',
      width: 60,
      render: (name: string) => (
        <Avatar 
          size={32} 
          icon={<UserOutlined />}
          style={{ backgroundColor: '#1890ff' }}
        />
      ),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span style={{ fontWeight: 500 }}>{name}</span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <span style={{ color: '#666', fontSize: '12px' }}>{email}</span>
      ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => (
        <div style={{ fontSize: '12px', color: '#666' }}>
          <div>{dayjs(date).format('DD/MM/YYYY')}</div>
          <div>{dayjs(date).format('HH:mm')}</div>
        </div>
      ),
    },

  ];

  return (
    <Card 
      title={
        <span>
          <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Người dùng mới nhất
        </span>
      }
      style={{ height: '100%' }}
    >
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={data?.map((item: any) => ({ ...item, key: item.id }))}
          pagination={false}
          size="small"
          scroll={{ y: 300 }}
        />
      )}
    </Card>
  );
};

export default RecentUsersTable; 