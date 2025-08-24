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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <RangePicker
        size="default"
        onChange={handleRangeChange}
        value={dateRange}
        placeholder={["Từ ngày", "Đến ngày"]}
        format="DD/MM/YYYY"
        allowClear
        style={{
          width: 250,
        }}
      />
    </div>
  );
};

export default RevenueFilterCard;
