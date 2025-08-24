import React from "react";
import { Card, Spin } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useOrdersByStatus } from "../../hook/dashboards/useOrdersByStatus";
import { ShoppingOutlined } from "@ant-design/icons";

const COLORS = [
  "#1890ff", // pending
  "#52c41a", // confirmed
  "#faad14", // processing
  "#722ed1", // shipping
  "#13c2c2", // delivered
  "#f5222d", // cancelled
  "#eb2f96", // completed
  "#ff7a45", // refunded
];

const OrdersStatusChart: React.FC = () => {
  const { data, isLoading } = useOrdersByStatus();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const statusMap: { [key: string]: string } = {
        pending: "Chờ xác nhận",
        confirmed: "Đã xác nhận",
        processing: "Đang xử lý",
        shipping: "Đang giao hàng",
        delivered: "Đã giao hàng",
        cancelled: "Đã huỷ",
        completed: "Đã hoàn thành",
        refunded: "Đã hoàn tiền",
      };

      const vietnameseName = statusMap[payload[0].name] || payload[0].name;

      return (
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: "12px",
            borderRadius: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            minWidth: "180px",
          }}
        >
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {vietnameseName}
          </p>
          <p
            style={{
              margin: "0 0 4px 0",
              color: payload[0].color,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: payload[0].color,
                borderRadius: "50%",
                display: "inline-block",
              }}
            ></span>
            Số lượng: {payload[0].value}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#666",
            }}
          >
            Tỷ lệ:{" "}
            {(
              (payload[0].value /
                data.reduce((sum: number, item: any) => sum + item.count, 0)) *
              100
            ).toFixed(1)}
            %
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    const statusMap: { [key: string]: string } = {
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      processing: "Đang xử lý",
      shipping: "Đang giao hàng",
      delivered: "Đã giao hàng",
      cancelled: "Đã huỷ",
      completed: "Đã hoàn thành",
      refunded: "Đã hoàn tiền",
    };

    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
          marginTop: "6px",
          padding: "0 6px",
        }}
      >
        {payload?.map((entry: any, index: number) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "11px",
              minWidth: "120px",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: entry.color,
                marginRight: "5px",
                borderRadius: "2px",
                flexShrink: 0,
              }}
            />
            <span style={{ whiteSpace: "nowrap" }}>
              {statusMap[entry.payload.status] || entry.payload.status} (
              {(
                (entry.payload.count /
                  data.reduce(
                    (sum: number, item: any) => sum + item.count,
                    0
                  )) *
                100
              ).toFixed(0)}
              %)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card
      title={
        <span>
          <ShoppingOutlined style={{ marginRight: 8, color: "#1890ff" }} />
          Đơn hàng theo trạng thái
        </span>
      }
      style={{ height: "100%" }}
    >
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 320,
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
              outerRadius={85}
              innerRadius={20}
              fill="#8884d8"
              dataKey="count"
              nameKey="status"
              paddingAngle={2}
            >
              {data?.map((_: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default OrdersStatusChart;
