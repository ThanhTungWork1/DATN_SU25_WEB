import React from "react";
import { Card, Statistic, DatePicker, Space, Spin } from "antd";
import { DollarOutlined, CalendarOutlined } from "@ant-design/icons";
import { useRevenueByTime } from "../../hook/dashboards/useRevenueByTime";
import { useRevenueDate } from "../../contexts/RevenueDateContext";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

const RevenueFilterCard: React.FC = () => {
  const { dateRange, setDateRange } = useRevenueDate();

  // Sử dụng hook có sẵn để lấy doanh thu theo thời gian
  const { data, isLoading } = useRevenueByTime(
    undefined, // Không dùng days, chỉ dùng range
    dateRange ? dateRange[0].format("YYYY-MM-DD") : undefined,
    dateRange ? dateRange[1].format("YYYY-MM-DD") : undefined
  );

  // Tính tổng doanh thu từ data
  const totalRevenue = React.useMemo(() => {
    if (!data) return 0;
    // Backend trả về array trực tiếp, không có data wrapper
    return data.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
  }, [data]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleRangeChange = (dates: any) => {
    setDateRange(dates);
  };

  const getTitle = () => {
    if (!dateRange) {
      return "Tổng doanh thu";
    }
    const startDate = dateRange[0].format("DD/MM/YYYY");
    const endDate = dateRange[1].format("DD/MM/YYYY");
    return `Doanh thu (${startDate} - ${endDate})`;
  };

  return (
    <Card>
      <div style={{ position: "relative" }}>
        {/* Header với title và date picker */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <DollarOutlined style={{ color: "#52c41a", fontSize: 16 }} />
            <span style={{ fontSize: 14, color: "#666", fontWeight: 500 }}>
              {getTitle()}
            </span>
          </div>
          <RangePicker
            size="small"
            onChange={handleRangeChange}
            value={dateRange}
            placeholder={["Từ ngày", "Đến ngày"]}
            format="DD/MM/YYYY"
            allowClear
            style={{
              width: 180,
              fontSize: 12,
            }}
          />
        </div>

        {/* Revenue value */}
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#52c41a" }}>
            {formatCurrency(totalRevenue)}
          </div>
          <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>VND</div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255,255,255,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
            }}
          >
            <Spin size="small" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default RevenueFilterCard;
