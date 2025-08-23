import React, { useState, useEffect, useMemo } from 'react';
import "../../../assets/styles/admin-responsive.css";
import {
  Card,
  Col,
  DatePicker,
  Empty,
  Row,
  Select,
  Spin,
  Statistic,
  Tag,
  Typography,
  Button,
  Progress,
  Table,
  message,
} from "antd";
import {
  BarChartOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ShoppingOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { getProducts, getProductStatistics } from "../../../api/product";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type TimePeriod = "week" | "month" | "quarter" | "custom";

type ProductLite = { id: number; name: string };

type TimeDataPoint = { period: string; orders: number; revenue: number };

type ProductStatisticsResponse = {
  total_orders: number;
  total_revenue: number;
  total_quantity_sold: number; // Backend trả về total_quantity_sold
  average_price: number; // Backend trả về average_price
  // Các trường dưới đây chưa có trong API response, tạm thời để optional
  top_variants?: Array<{
    id: number;
    color?: string;
    size?: string;
    sold_quantity: number;
    revenue: number;
  }>;
  time_data?: TimeDataPoint[];
};

const ProductStatistics: React.FC = () => {
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | undefined>();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [averagePerItem, setAveragePerItem] = useState<number>(0);
  const [timeData, setTimeData] = useState<TimeDataPoint[]>([]);
  const [topVariants, setTopVariants] = useState<
    ProductStatisticsResponse["top_variants"]
  >([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching products list...");

      const res = await getProducts({ page: 1, per_page: 1000 });
      console.log("📥 Products API response:", res);

      // Admin products index trả về paginator Laravel thô
      const data: any = (res as any).data;
      console.log("📊 Products data:", data);

      const items: any[] = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];
      console.log("📦 Products items:", items);

      const mapped: ProductLite[] = items.map((p: any) => ({
        id: p.id,
        name: p.name,
      }));
      console.log("🗺️ Mapped products:", mapped);

      setProducts(mapped);
      if (mapped.length > 0) {
        const firstProductId = mapped[0].id;
        console.log("🎯 Setting first product as selected:", firstProductId);
        setSelectedProduct((prev) => prev ?? firstProductId);
      } else {
        console.log("⚠️ No products found!");
      }
    } catch (e) {
      console.error("❌ Error fetching products:", e);
      message.error("Không tải được danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductStatistics = async (productId: number) => {
    try {
      setLoading(true);
      console.log("🔍 Fetching statistics for product ID:", productId);

      let params: any = {};
      if (timePeriod !== "custom") {
        params.period = timePeriod;
      } else if (dateRange) {
        params.period = "custom";
        params.start_date = dateRange[0].format("YYYY-MM-DD");
        params.end_date = dateRange[1].format("YYYY-MM-DD");
      }

      console.log("📤 API params:", params);

      const res = await getProductStatistics(productId, params);
      console.log("📥 Raw API response:", res);

      // API trả về dữ liệu trong `res.data.data` (có wrapper success)
      const d = (res as any).data.data as ProductStatisticsResponse;
      console.log("📊 Parsed data:", d);

      const orders = d.total_orders || 0;
      const revenue = d.total_revenue || 0;
      const items = d.total_quantity_sold || 0; // Backend trả về total_quantity_sold
      const avgPrice = d.average_price || 0; // Backend trả về average_price

      console.log("📈 Setting state values:");
      console.log("  - Total Orders:", orders);
      console.log("  - Total Revenue:", revenue);
      console.log("  - Total Items:", items);
      console.log("  - Average Price:", avgPrice);

      setTotalOrders(orders);
      setTotalRevenue(revenue);
      setTotalItems(items);
      setAveragePerItem(avgPrice);

      // Xử lý các trường có thể không tồn tại
      const timeDataArray = Array.isArray(d.time_data) ? d.time_data : [];
      const topVariantsArray = Array.isArray(d.top_variants)
        ? d.top_variants
        : [];

      console.log("📅 Time data:", timeDataArray);
      console.log("🏆 Top variants:", topVariantsArray);

      setTimeData(timeDataArray);
      setTopVariants(topVariantsArray);

      console.log("✅ Statistics loaded successfully!");
    } catch (e: any) {
      console.error("❌ Error fetching statistics:", e);
      console.error("❌ Error details:", e.response?.data);
      message.error("Không tải được thống kê sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🚀 ProductStatistics component mounted");
    fetchProducts();
  }, []);

  useEffect(() => {
    console.log(
      "🔄 useEffect triggered - selectedProduct:",
      selectedProduct,
      "timePeriod:",
      timePeriod
    );
    if (selectedProduct) {
      fetchProductStatistics(selectedProduct);
    } else {
      console.log("⚠️ No product selected, skipping statistics fetch");
    }
  }, [selectedProduct, timePeriod, dateRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    })
      .format(value)
      .replace("₫", " VND");
  };

  const safePercent = (value: number, arr: number[]) => {
    const max = Math.max(...arr, 0);
    return max > 0 ? Math.round((value / max) * 100) : 0;
  };

  const ordersArray = useMemo(() => timeData.map((t) => t.orders), [timeData]);
  const revenueArray = useMemo(
    () => timeData.map((t) => t.revenue),
    [timeData]
  );

  const topVariantsColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    { title: "Màu", dataIndex: "color", key: "color" },
    { title: "Size", dataIndex: "size", key: "size" },
    {
      title: "Số lượng bán",
      dataIndex: "sold_quantity",
      key: "sold_quantity",
      align: "center" as const,
      render: (q: number) => <Tag color="blue">{q} SP</Tag>,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      align: "right" as const,
      render: (r: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatCurrency(r)}
        </Text>
      ),
    },
  ];

  console.log("🎨 Rendering ProductStatistics component");
  console.log("📊 Current state:");
  console.log("  - loading:", loading);
  console.log("  - selectedProduct:", selectedProduct);
  console.log("  - products count:", products.length);
  console.log("  - totalOrders:", totalOrders);
  console.log("  - totalRevenue:", totalRevenue);
  console.log("  - totalItems:", totalItems);
  console.log("  - averagePerItem:", averagePerItem);
  console.log("  - timeData count:", timeData.length);
  console.log("  - topVariants count:", topVariants?.length || 0);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const selectedProductName =
    products.find((p) => p.id === selectedProduct)?.name || "";

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
            <BarChartOutlined /> Thống Kê Sản Phẩm
          </Title>
          <Text type="secondary">
            Phân tích chi tiết hiệu suất theo từng sản phẩm
          </Text>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Select
            style={{ width: 280 }}
            placeholder="Chọn sản phẩm"
            showSearch
            optionFilterProp="label"
            value={selectedProduct}
            onChange={setSelectedProduct}
            options={products.map((p) => ({ value: p.id, label: p.name }))}
          />

          <Select
            style={{ width: 160 }}
            value={timePeriod}
            onChange={(val: TimePeriod) => {
              setTimePeriod(val);
              if (val !== "custom") setDateRange(null);
            }}
            options={[
              { value: "week", label: "Tuần này" },
              { value: "month", label: "Tháng này" },
              { value: "quarter", label: "Quý này" },
              { value: "custom", label: "Tùy chọn" },
            ]}
          />

          {timePeriod === "custom" && (
            <RangePicker
              value={dateRange as any}
              onChange={(val) => setDateRange(val as any)}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
              format="YYYY-MM-DD"
            />
          )}

          <Button
            icon={<ReloadOutlined />}
            onClick={() =>
              selectedProduct && fetchProductStatistics(selectedProduct)
            }
          >
            Làm mới
          </Button>
        </div>
      </div>

      {!selectedProduct ? (
        <Card>
          <Empty description="Vui lòng chọn sản phẩm" />
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Tổng đơn hàng"
                  value={totalOrders}
                  prefix={<ShoppingCartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  valueRender={() => (
                    <span>{formatCurrency(totalRevenue)}</span>
                  )}
                  prefix={<DollarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Tổng số lượng"
                  value={totalItems}
                  prefix={<ShoppingOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={6}>
              <Card>
                <Statistic
                  title="Giá TB / SP"
                  valueRender={() => (
                    <span>{formatCurrency(averagePerItem)}</span>
                  )}
                  prefix={<RiseOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts-like Progress */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} md={12}>
              <Card title={`Đơn hàng theo thời gian - ${selectedProductName}`}>
                {timeData.length === 0 ? (
                  <Empty description="Không có dữ liệu" />
                ) : (
                  <div>
                    {timeData.map((t, idx) => (
                      <div key={idx} style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text strong>{t.period}</Text>
                          <Text>{t.orders} đơn</Text>
                        </div>
                        <Progress
                          percent={safePercent(t.orders, ordersArray)}
                          showInfo={false}
                          status="active"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title={`Doanh thu theo thời gian - ${selectedProductName}`}>
                {timeData.length === 0 ? (
                  <Empty description="Không có dữ liệu" />
                ) : (
                  <div>
                    {timeData.map((t, idx) => (
                      <div key={idx} style={{ marginBottom: 12 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text strong>{t.period}</Text>
                          <Text>{formatCurrency(t.revenue)}</Text>
                        </div>
                        <Progress
                          percent={safePercent(t.revenue, revenueArray)}
                          showInfo={false}
                          status="active"
                          strokeColor="#52c41a"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {/* Top variants */}
          <Card style={{ marginTop: 16 }} title="Top 5 Biến Thể Bán Chạy">
            <Table
              dataSource={topVariants}
              columns={topVariantsColumns as any}
              rowKey={(r) => String(r.id)}
              pagination={false}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default ProductStatistics;
