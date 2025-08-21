import React from "react";
import { Card, Table, Spin, Image, Tag } from "antd";
import { useTopSellingProducts } from "../../hook/dashboards/useTopSellingProducts";
import { useRevenueDate } from "../../contexts/RevenueDateContext";
import { TrophyOutlined } from "@ant-design/icons";

const TopProductsTable: React.FC = () => {
  const { dateRange } = useRevenueDate();

  const { data, isLoading } = useTopSellingProducts(
    10,
    dateRange ? dateRange[0].format("YYYY-MM-DD") : undefined,
    dateRange ? dateRange[1].format("YYYY-MM-DD") : undefined
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    })
      .format(value)
      .replace("₫", " VND");
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: index < 3 ? "#1890ff" : "#f0f0f0",
            color: index < 3 ? "white" : "#666",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {index + 1}
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Image
            src={record.image || "/logo.png"}
            alt={name}
            width={40}
            height={40}
            style={{ objectFit: "cover", borderRadius: "4px" }}
            fallback="/logo.png"
          />
          <span style={{ fontWeight: 500 }}>{name}</span>
        </div>
      ),
    },
    {
      title: "Đã bán",
      dataIndex: "total_sold",
      key: "total_sold",
      width: 100,
      render: (value: number) => (
        <Tag color="blue" style={{ fontWeight: "bold" }}>
          {value.toLocaleString()}
        </Tag>
      ),
    },
    {
      title: "Doanh thu",
      dataIndex: "total_revenue",
      key: "total_revenue",
      width: 120,
      render: (value: number) => (
        <span style={{ fontWeight: "bold", color: "#52c41a" }}>
          {formatCurrency(value)}
        </span>
      ),
    },
  ];

  return (
    <Card
      title={
        <span>
          <TrophyOutlined style={{ marginRight: 8, color: "#faad14" }} />
          Top sản phẩm bán chạy
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
            height: 300,
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={data?.map((item: any, index: number) => ({
            ...item,
            key: item.id,
            index,
          }))}
          pagination={false}
          size="small"
          scroll={{ y: 300 }}
          rowClassName={(record, index) => {
            if (index === 0) return "top-product-gold";
            if (index === 1) return "top-product-silver";
            if (index === 2) return "top-product-bronze";
            return "";
          }}
        />
      )}
    </Card>
  );
};

export default TopProductsTable;
