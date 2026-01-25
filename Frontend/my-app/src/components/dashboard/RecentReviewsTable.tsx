import React from 'react';
import { Card, Table, Spin, Tag, Rate } from 'antd';
import { useRecentReviews } from '../../hook/dashboards/useRecentReviews';
import { MessageOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const RecentReviewsTable: React.FC = () => {
  const { data, isLoading } = useRecentReviews(10);

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (name: string) => (
        <span style={{ fontWeight: 500 }}>{name}</span>
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (name: string) => (
        <span style={{ color: '#1890ff' }}>{name}</span>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      render: (rating: number) => (
        <Rate disabled defaultValue={rating} size="small" />
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => (
        <div style={{ 
          maxWidth: 200, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap',
          fontSize: '12px',
          color: '#666'
        }}>
          {content}
        </div>
      ),
    },
    {
      title: 'Ngày đánh giá',
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
          <MessageOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Đánh giá gần đây
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

export default RecentReviewsTable; 