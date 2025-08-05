import React from 'react';
import { Card, Table, Spin, Tag, Button } from 'antd';
import { useLowStockProducts } from '../../hook/dashboards/useLowStockProducts';
import { ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const LowStockAlert: React.FC = () => {
  const { data, isLoading } = useLowStockProducts(5);
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value).replace('₫', ' VND');
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { color: 'error', text: 'Hết hàng' };
    } else if (stock < 5) {
      return { color: 'error', text: 'Nguy hiểm' };
    } else {
      return { color: 'warning', text: 'Sắp hết' };
    }
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
          backgroundColor: '#ff4d4f', 
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
      title: 'Tên sản phẩm',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (name: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: '12px', marginBottom: '4px' }}>
            {name}
          </div>
                     <div style={{ fontSize: '10px', color: '#666' }}>
             {record.low_stock_variants?.map((variant: any, idx: number) => (
               <div key={idx} style={{ marginBottom: '2px' }}>
                 • {variant.size_name} ({variant.color_name}): {variant.stock}
               </div>
             ))}
           </div>
        </div>
      ),
    },
    {
      title: 'Tồn kho thấp nhất',
      dataIndex: 'min_stock',
      key: 'min_stock',
      width: 100,
      render: (minStock: number, record: any) => {
        const status = getStockStatus(minStock);
        return (
          <div>
            <Tag color={status.color} style={{ fontSize: '11px', padding: '1px 6px' }}>
              {minStock}
            </Tag>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
              {record.total_low_stock_variants} size
            </div>
          </div>
        );
      },
    },
    {
      title: 'Giá',
      dataIndex: 'low_stock_variants',
      key: 'price',
      width: 100,
             render: (variants: any[]) => {
         const minPrice = variants.length > 0 ? Math.min(...variants.map((v: any) => v.price)) : 0;
         return (
           <span style={{ fontWeight: 'bold', color: '#52c41a', fontSize: '12px' }}>
             {formatCurrency(minPrice)}
           </span>
         );
       },
    },
  ];

  const handleViewAll = () => {
    navigate('/admin/products');
  };

  return (
    <Card 
      title={
        <span>
          <ExclamationCircleOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
          Báo hàng tồn kho
        </span>
      }
      style={{ height: '100%', fontSize: '12px' }}
      extra={
        <Button
          type="link"
          icon={<EyeOutlined />}
          size="small"
          onClick={handleViewAll}
          style={{ fontSize: '11px', padding: '2px 8px' }}
        >
          Xem tất cả
        </Button>
      }
    >
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Thống kê tổng quan */}
          <div style={{ marginBottom: 16, padding: '12px', backgroundColor: '#fff2f0', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '12px', color: '#666' }}>
                📦 {data?.total_low_stock || 0} sản phẩm sắp hết hàng
              </span>
              <span style={{ fontSize: '12px', color: '#ff4d4f', fontWeight: 'bold' }}>
                ❌ {data?.out_of_stock || 0} sản phẩm hết hàng
              </span>
            </div>
          </div>

          {/* Bảng sản phẩm */}
          <Table
            columns={columns}
            dataSource={data?.low_stock_products?.map((item: any) => ({ ...item, key: item.product_id }))}
            pagination={false}
            size="small"
            scroll={{ y: 200 }}
            style={{ fontSize: '12px' }}
          />
        </>
      )}
    </Card>
  );
};

export default LowStockAlert; 