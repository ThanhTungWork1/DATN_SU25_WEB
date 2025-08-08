import React from 'react';
import { Card, Table, Spin, Tag, Button } from 'antd';
import { useRecentOrders } from '../../hook/dashboards/useRecentOrders';
import { ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const RecentOrdersTable: React.FC = () => {
  const { data, isLoading } = useRecentOrders(10);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value).replace('₫', ' VND');
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'pending': 'orange',
      'confirmed': 'blue',
      'processing': 'processing',
      'shipping': 'purple',
      'delivered': 'success',
      'cancelled': 'error',
      'completed': 'green',
    };
    return statusColors[status] || 'default';
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <div style={{ 
          width: 24, 
          height: 24, 
          borderRadius: '50%', 
          backgroundColor: '#1890ff', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {index + 1}
        </div>
      ),
    },
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id: number) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '12px' }}>
          #{id.toString().padStart(6, '0')}
        </span>
      ),
    },
    {
      title: 'Số SP',
      dataIndex: 'item_count',
      key: 'item_count',
      width: 70,
      render: (count: number) => (
        <div style={{ 
          backgroundColor: '#e6f7ff', 
          color: '#1890ff', 
          padding: '2px 8px', 
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          textAlign: 'center',
          minWidth: '24px',
          display: 'inline-block'
        }}>
          {count}
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'final_amount',
      key: 'final_amount',
      width: 110,
      render: (value: number) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a', fontSize: '12px' }}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: { [key: string]: string } = {
          'pending': 'Chờ xác nhận',
          'confirmed': 'Đã xác nhận',
          'processing': 'Đang xử lý',
          'shipping': 'Đang giao hàng',
          'delivered': 'Đã giao hàng',
          'cancelled': 'Đã huỷ',
          'completed': 'Đã hoàn thành'
        };
        return (
          <Tag color={getStatusColor(status)} style={{ fontSize: '11px', padding: '1px 6px' }}>
            {statusMap[status] || status}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 90,
      render: (date: string) => (
        <div style={{ fontSize: '11px', color: '#666' }}>
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
          <ClockCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Đơn hàng gần đây
        </span>
      }
      style={{ height: '100%', fontSize: '12px' }}
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
           style={{ fontSize: '12px' }}
         />
      )}
    </Card>
  );
};

export default RecentOrdersTable; 