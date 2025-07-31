import React from 'react';
import { Card, Select, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useRevenueByTime } from '../../hook/dashboards/useRevenueByTime';
import { DollarOutlined } from '@ant-design/icons';

const { Option } = Select;

const RevenueChart: React.FC = () => {
  const [days, setDays] = React.useState(30);
  const { data, isLoading } = useRevenueByTime(days);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value).replace('₫', ' VND');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0 }}><strong>Ngày: {formattedDate}</strong></p>
          <p style={{ margin: 0, color: '#1890ff' }}>
            Doanh thu: {formatCurrency(payload[0].value)}
          </p>
          <p style={{ margin: 0, color: '#52c41a' }}>
            Đơn hàng: {payload[1]?.value || 0}
          </p>
        </div>
      );
    }
    return null;
  };

  // Tính toán interval cho XAxis dựa trên số ngày
  const getXAxisInterval = () => {
    if (days <= 7) return 0; // Hiển thị tất cả ngày cho 7 ngày
    if (days <= 30) return Math.floor(days / 7); // Hiển thị mỗi tuần cho 30 ngày
    return Math.floor(days / 10); // Hiển thị mỗi 10 ngày cho 90 ngày
  };

  // Tính toán angle cho tick dựa trên số ngày
  const getTickAngle = () => {
    if (days <= 7) return -45; // Xoay 45 độ cho 7 ngày
    if (days <= 30) return -30; // Xoay 30 độ cho 30 ngày
    return 0; // Không xoay cho 90 ngày
  };

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>
            <DollarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Biểu đồ doanh thu
          </span>
          <Select 
            value={days} 
            onChange={setDays}
            style={{ width: 120 }}
            size="small"
          >
            <Option value={7}>7 ngày</Option>
            <Option value={30}>30 ngày</Option>
            <Option value={90}>90 ngày</Option>
          </Select>
        </div>
      }
      style={{ height: '100%' }}
    >
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Spin size="large" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                         <XAxis 
               dataKey="date" 
               tick={{ fontSize: 12, angle: getTickAngle(), textAnchor: 'end' }}
               tickFormatter={(value) => {
                 const date = new Date(value);
                 if (days <= 7) {
                   // Hiển thị ngắn gọn hơn cho 7 ngày
                   return date.toLocaleDateString('vi-VN', { day: '2-digit' });
                 }
                 return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
               }}
               interval={getXAxisInterval()}
               minTickGap={30}
               height={60}
             />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="#1890ff" 
              strokeWidth={2}
              dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#1890ff', strokeWidth: 2 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="order_count" 
              stroke="#52c41a" 
              strokeWidth={2}
              dot={{ fill: '#52c41a', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#52c41a', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default RevenueChart; 