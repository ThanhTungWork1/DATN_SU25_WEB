import React from 'react';
import { Card, Spin } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useRatingStats } from '../../hook/dashboards/useRatingStats';
import { StarOutlined } from '@ant-design/icons';

const COLORS = ['#ff4d4f', '#ff7a45', '#ffa940', '#ffc53d', '#52c41a'];

const RatingStatsChart: React.FC = () => {
  const { data, isLoading } = useRatingStats();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0 }}><strong>{label} sao</strong></p>
          <p style={{ margin: 0, color: '#1890ff' }}>
            Số lượng: {payload[0].value}
          </p>
          <p style={{ margin: 0, color: '#52c41a' }}>
            Tỷ lệ: {payload[0].payload.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderStarLabel = (value: number) => {
    return `${value} ⭐`;
  };

  return (
    <Card 
      title={
        <span>
          <StarOutlined style={{ marginRight: 8, color: '#faad14' }} />
          Thống kê đánh giá theo sao
        </span>
      }
      style={{ height: '100%' }}
    >
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Spin size="large" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis 
              dataKey="rating" 
              tick={{ fontSize: 12 }}
              tickFormatter={renderStarLabel}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#1890ff">
              {data?.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.rating - 1] || '#1890ff'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default RatingStatsChart; 