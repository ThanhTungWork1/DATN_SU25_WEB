import React from 'react';
import { Card, Select, Spin, DatePicker, Space } from 'antd';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useRevenueByTime } from '../../hook/dashboards/useRevenueByTime';
import { DollarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const RevenueChart: React.FC = () => {
  const [days, setDays] = React.useState<number | undefined>(30);
  const [range, setRange] = React.useState<[Dayjs, Dayjs] | null>(null);
  const { data, isLoading } = useRevenueByTime(
    days,
    range ? range[0].format('YYYY-MM-DD') : undefined,
    range ? range[1].format('YYYY-MM-DD') : undefined
  );

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

  // Số ngày dùng cho tính toán trục (ưu tiên theo range nếu có)
  const daysForCalc = React.useMemo(() => {
    if (range) {
      return range[1].diff(range[0], 'day') + 1;
    }
    return days ?? 30;
  }, [range, days]);

  // Tính toán interval cho XAxis dựa trên số ngày
  const getXAxisInterval = () => {
    if (daysForCalc <= 7) return 0; // Hiển thị tất cả ngày cho 7 ngày
    if (daysForCalc <= 30) return Math.floor(daysForCalc / 7); // Hiển thị mỗi tuần cho 30 ngày
    return Math.floor(daysForCalc / 10); // Hiển thị mỗi 10 ngày cho 90 ngày
  };

  // Tính toán angle cho tick dựa trên số ngày
  const getTickAngle = () => {
    if (daysForCalc <= 7) return -45; // Xoay 45 độ cho 7 ngày
    if (daysForCalc <= 30) return -30; // Xoay 30 độ cho 30 ngày
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
          <Space size={8}>
            <Select 
              value={days}
              onChange={(val) => { setDays(val); setRange(null); }}
              style={{ width: 120 }}
              size="small"
              placeholder="Theo ngày"
              allowClear
            >
              <Option value={7}>7 ngày</Option>
              <Option value={30}>30 ngày</Option>
              <Option value={90}>90 ngày</Option>
            </Select>
            <RangePicker
              allowClear
              size="small"
              value={range as any}
              onChange={(vals) => {
                if (vals && vals[0] && vals[1]) {
                  setRange(vals as [Dayjs, Dayjs]);
                  setDays(undefined);
                } else {
                  setRange(null);
                }
              }}
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Space>
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
               tick={{ fontSize: 12, angle: getTickAngle(), textAnchor: 'end' } as any}
               tickFormatter={(value) => {
                 const date = new Date(value);
                 if (daysForCalc <= 7) {
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
              dataKey="total" 
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