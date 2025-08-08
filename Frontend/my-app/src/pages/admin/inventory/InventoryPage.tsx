import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Image,
  Row,
  Col,
  Statistic,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useInventoryStats } from "../../../hook/inventory/useInventoryStats";
import { useInventoryList } from "../../../hook/inventory/useInventoryList";
import { useNavigate } from "react-router-dom";

const { Search } = Input;

const InventoryPage: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  // Fetch real data
  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useInventoryStats();
  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    refetch: refetchInventory,
  } = useInventoryList(searchText, currentPage, pageSize);

  // Tính toán thống kê từ dữ liệu thật
  const stats = {
    totalProducts: statsData?.total_products || 0,
    lowStock: statsData?.low_stock_products || 0,
    outOfStock: statsData?.out_of_stock_products || 0,
    totalValue: statsData?.total_value || 0,
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "in_stock":
        return <Tag color="success">Còn hàng</Tag>;
      case "low_stock":
        return <Tag color="warning">Sắp hết</Tag>;
      case "out_of_stock":
        return <Tag color="error">Hết hàng</Tag>;
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

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
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) => (
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            backgroundColor: "#1890ff",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {index + 1}
        </div>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: 80,
      render: (image: string) => (
        <Image
          src={image}
          alt="Product"
          width={50}
          height={50}
          style={{ objectFit: "cover", borderRadius: "4px" }}
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <div>
          <div
            style={{ fontWeight: 500, fontSize: "14px", marginBottom: "4px" }}
          >
            {name}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.category}
          </div>
        </div>
      ),
    },
    {
      title: "Tồn kho",
      key: "stock",
      width: 120,
      render: (record: any) => (
        <div>
          <div style={{ fontWeight: "bold", fontSize: "14px" }}>
            {record.total_stock} (Tổng)
          </div>
          <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>
            {record.variants.map((v: any, idx: number) => (
              <div key={idx} style={{ marginBottom: "1px" }}>
                • {v.size_name} ({v.color_name}): {v.stock_available}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price: number) => (
        <span
          style={{ fontWeight: "bold", color: "#52c41a", fontSize: "14px" }}
        >
          {formatCurrency(price)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 100,
      render: (record: any) => getStatusTag(record.status),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
    // TODO: Implement search logic
  };

  const handleRefresh = () => {
    refetchStats();
    refetchInventory();
    message.success("Đã làm mới dữ liệu!");
  };

  const handleAddNewProduct = () => {
    navigate("/admin/products/create");
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
          📦 Quản lý tồn kho
        </h1>
        <p style={{ color: "#666", margin: "8px 0 0 0" }}>
          Theo dõi và quản lý hàng tồn kho của cửa hàng
        </p>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Tổng sản phẩm"
              value={stats.totalProducts}
              prefix="📦"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Sắp hết hàng"
              value={stats.lowStock}
              prefix="⚠️"
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Hết hàng"
              value={stats.outOfStock}
              prefix="❌"
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="Tổng giá trị"
              value={formatCurrency(stats.totalValue)}
              prefix="💰"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions & Search */}
      <Card style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddNewProduct}
            >
              Nhập hàng mới
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={statsLoading || inventoryLoading}
            >
              Làm mới
            </Button>
          </Space>
          <Search
            placeholder="Tìm kiếm sản phẩm..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ width: 300 }}
            onSearch={handleSearch}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </Card>

      {/* Inventory Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={
            inventoryData?.data?.map((item: any, index: number) => ({
              ...item,
              key: item.id,
            })) || []
          }
          pagination={{
            total: inventoryData?.total || 0,
            current: currentPage,
            pageSize: pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `Hiển thị ${range[0]}-${range[1]} trên tổng ${total} sản phẩm`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          loading={inventoryLoading}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default InventoryPage;
