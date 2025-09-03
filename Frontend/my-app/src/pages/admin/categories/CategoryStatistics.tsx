import React, { useState, useEffect } from "react";
import "../../../assets/styles/admin-responsive.css";
import {
  Card,
  Select,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Typography,
  DatePicker,
  Spin,
  Button,
  Tag,
  Empty,
} from "antd";
import {
  BarChartOutlined,
  ShoppingCartOutlined,
  DollarCircleOutlined,
  TrophyOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getCategories,
  getCategoryDetailStatistics,
} from "../../../api/category";
import { Category } from "../../../types/ProductType";

const { Title, Text } = Typography;
const { Option } = Select;

interface TopProduct {
  id: number;
  name: string;
  sold_quantity: number;
  revenue: number;
}

interface TimeData {
  period: string;
  revenue: number;
  orders: number;
}

const CategoryStatistics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [timePeriod, setTimePeriod] = useState<
    "week" | "month" | "quarter" | "custom"
  >("month");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  // Dữ liệu thống kê
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [averagePerItem, setAveragePerItem] = useState(0);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [timeData, setTimeData] = useState<TimeData[]>([]);

  // Lấy dữ liệu thống kê từ API
  const fetchCategoryStatistics = async (categoryId: number) => {
    try {
      console.log("🔄 BẮT ĐẦU fetchCategoryStatistics");
      console.log("📊 Category ID:", categoryId);
      console.log("⏰ Time Period:", timePeriod);
      console.log("📅 Date Range:", dateRange);

      setLoading(true);

      // Chuẩn bị params cho API
      const params: any = {
        period: timePeriod === "custom" ? "custom" : timePeriod,
      };

      // Nếu là custom period và có dateRange
      if (
        timePeriod === "custom" &&
        dateRange &&
        dateRange[0] &&
        dateRange[1]
      ) {
        params.start_date = dateRange[0].format("YYYY-MM-DD");
        params.end_date = dateRange[1].format("YYYY-MM-DD");
        console.log(
          "📅 Custom date range:",
          params.start_date,
          "to",
          params.end_date
        );
      }

      console.log("🚀 Gọi API với params:", { categoryId, params });
      console.log(
        "🌐 API URL sẽ gọi:",
        `http://127.0.0.1:8000/api/admin/categories/${categoryId}/statistics`
      );

      // Thêm timestamp để tránh cache
      const response = await getCategoryDetailStatistics(categoryId, {
        ...params,
        _t: Date.now(), // Force refresh
      });

      console.log("✅ API Response Status:", response.status);
      console.log("📦 API Response Headers:", response.headers);
      console.log("📄 API Response Data:", response.data);

      const data = response.data as any;

      console.log("🔍 Parsing data:");
      console.log("  - total_orders:", data.total_orders);
      console.log("  - total_revenue:", data.total_revenue);
      console.log("  - top_products:", data.top_products);
      console.log("  - time_data:", data.time_data);
      console.log("  - debug info:", data.debug);

      // 🔍 DEBUG: Kiểm tra chi tiết top_products
      if (data.top_products && Array.isArray(data.top_products)) {
        console.log("🔍 TOP PRODUCTS DETAILS:");
        data.top_products.forEach((product: any, index: number) => {
          console.log(
            `  [${index}] ID: ${product.id}, Name: "${product.name}", Qty: ${product.sold_quantity}, Revenue: ${product.revenue}`
          );
        });
      }

      // Cập nhật state với dữ liệu thực từ API
      setTotalOrders(data.total_orders || 0);
      setTotalRevenue(data.total_revenue || 0);
      setTotalItems(data.total_items || 0);
      setAveragePerItem(data.average_per_item || 0);
      setTopProducts(data.top_products || []);
      setTimeData(data.time_data || []);

      console.log("✅ State updated successfully");
      console.log("🔍 FINAL VALUES:");
      console.log("  - Total Orders:", data.total_orders || 0);
      console.log("  - Total Revenue:", data.total_revenue || 0);
      console.log("  - Filter Note:", data.filter_note || "N/A");

      // 🔍 DEBUG: Kiểm tra state topProducts sau khi update
      console.log("🔍 STATE TOP PRODUCTS AFTER UPDATE:");
      console.log("  - Array length:", (data.top_products || []).length);
      console.log("  - State value:", data.top_products);

      // Hiển thị thông báo nếu không có dữ liệu
      if (
        !data.total_orders &&
        !data.total_revenue &&
        (!data.top_products || data.top_products.length === 0)
      ) {
        console.warn("⚠️ Không có dữ liệu thống kê cho danh mục này");
      } else {
        console.log("🎉 Có dữ liệu thống kê!");
      }
    } catch (error: any) {
      console.error("❌ LỖI khi tải thống kê danh mục:");
      console.error("  - Error object:", error);
      console.error("  - Error message:", error.message);
      console.error("  - Error response:", error.response);
      console.error("  - Error response data:", error.response?.data);
      console.error("  - Error response status:", error.response?.status);

      // Fallback về dữ liệu rỗng nếu có lỗi
      setTotalOrders(0);
      setTotalRevenue(0);
      setTopProducts([]);
      setTimeData([]);
    } finally {
      setLoading(false);
      console.log("🏁 fetchCategoryStatistics HOÀN THÀNH");
    }
  };

  // Tải danh sách danh mục
  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Thêm timestamp để tránh cache
      const res = await getCategories();
      const categoriesData = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];

      console.log("📊 Categories loaded:", categoriesData.length);
      console.log("📋 Categories data:", categoriesData);

      setCategories(categoriesData);

      // Chọn danh mục đầu tiên làm mặc định
      if (categoriesData.length > 0 && !selectedCategory) {
        setSelectedCategory(categoriesData[0].id);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách danh mục:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tải thống kê khi thay đổi danh mục hoặc thời gian
  useEffect(() => {
    fetchCategories();
  }, []);

  // Cập nhật thống kê khi thay đổi danh mục, thời gian hoặc khoảng ngày
  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryStatistics(selectedCategory);
    }
  }, [selectedCategory, timePeriod, dateRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    })
      .format(value)
      .replace("₫", " VND");
  };

  // Tránh NaN/Infinity khi mảng rỗng hoặc max = 0
  const safePercent = (value: number, arr: number[]) => {
    const max = Math.max(...arr, 0);
    return max > 0 ? Math.round((value / max) * 100) : 0;
  };

  // Cột cho bảng sản phẩm bán chạy
  const topProductsColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số lượng bán",
      dataIndex: "sold_quantity",
      key: "sold_quantity",
      align: "center" as const,
      render: (quantity: number) => <Tag color="blue">{quantity} SP</Tag>,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      align: "right" as const,
      render: (revenue: number) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatCurrency(revenue)}
        </Text>
      ),
    },
  ];

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

  const selectedCategoryName =
    categories.find((cat) => cat.id === selectedCategory)?.name || "";

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
            <BarChartOutlined /> Thống Kê Danh Mục
          </Title>
          <Text type="secondary">
            Phân tích chi tiết hiệu suất theo từng danh mục sản phẩm
          </Text>
        </div>
        <Button
          type="primary"
          icon={<DollarCircleOutlined />}
          onClick={() => {
            if (selectedCategory) {
              fetchCategoryStatistics(selectedCategory);
            }
          }}
        >
          Làm mới
        </Button>
      </div>

      {/* Bộ lọc */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>Chọn danh mục ({categories.length}):</Text>
          </Col>
          <Col flex="auto">
            <Select
              placeholder="Chọn danh mục"
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: 200 }}
              listHeight={400}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Text strong>Thời gian:</Text>
          </Col>
          <Col>
            <Select
              style={{ width: 120 }}
              value={timePeriod}
              onChange={(value) => {
                setTimePeriod(value);
                if (value !== "custom") {
                  setDateRange(null);
                }
              }}
            >
              <Option value="week">Tuần</Option>
              <Option value="month">Tháng</Option>
              <Option value="quarter">Quý</Option>
              <Option value="custom">Tùy chỉnh</Option>
            </Select>
          </Col>
          {timePeriod === "custom" && (
            <>
              <Col>
                <Text strong>Từ ngày - đến ngày:</Text>
              </Col>
              <Col>
                <DatePicker.RangePicker
                  style={{ width: 280 }}
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder={["Từ ngày", "Đến ngày"]}
                  format="DD/MM/YYYY"
                />
              </Col>
            </>
          )}
        </Row>
      </Card>

      {selectedCategory ? (
        <>
          {/* Thống kê tổng quan */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={`Tổng đơn hàng - ${selectedCategoryName}`}
                  value={totalOrders}
                  prefix={<ShoppingCartOutlined style={{ color: "#1890ff" }} />}
                  valueStyle={{ color: "#1890ff" }}
                  suffix="đơn"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title={`Tổng doanh thu - ${selectedCategoryName}`}
                  value={totalRevenue}
                  prefix={<DollarCircleOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a" }}
                  formatter={(value) => formatCurrency(value as number)}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Giá trung bình/sản phẩm"
                  value={averagePerItem}
                  prefix={<DollarCircleOutlined style={{ color: "#722ed1" }} />}
                  valueStyle={{ color: "#722ed1" }}
                  formatter={(value) => formatCurrency(value as number)}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Sản phẩm bán chạy"
                  value={topProducts.length}
                  prefix={<TrophyOutlined style={{ color: "#faad14" }} />}
                  valueStyle={{ color: "#faad14" }}
                  suffix="sản phẩm"
                />
              </Card>
            </Col>
          </Row>

          {/* Biểu đồ và bảng */}
          <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
            {/* Biểu đồ số lượng đơn hàng theo thời gian */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <>
                    <BarChartOutlined /> Số Lượng Đơn Hàng Theo{" "}
                    {timePeriod === "week"
                      ? "Tuần"
                      : timePeriod === "month"
                        ? "Tháng"
                        : timePeriod === "quarter"
                          ? "Quý"
                          : "Khoảng thời gian"}
                  </>
                }
              >
                <div style={{ padding: "20px" }}>
                  {timeData.map((item, index) => (
                    <div key={index} style={{ marginBottom: "15px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "5px",
                        }}
                      >
                        <Text>{item.period}</Text>
                        <Text strong style={{ color: "#1890ff" }}>
                          {item.orders} đơn
                        </Text>
                      </div>
                      <Progress
                        percent={safePercent(
                          item.orders,
                          timeData.map((d) => d.orders)
                        )}
                        strokeColor="#1890ff"
                        showInfo={false}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
            {/* Biểu đồ doanh thu theo thời gian */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <>
                    <LineChartOutlined /> Doanh Thu Theo{" "}
                    {timePeriod === "week"
                      ? "Tuần"
                      : timePeriod === "month"
                        ? "Tháng"
                        : timePeriod === "quarter"
                          ? "Quý"
                          : "Khoảng thời gian"}
                  </>
                }
              >
                <div style={{ padding: "20px" }}>
                  {timeData.map((item, index) => (
                    <div key={index} style={{ marginBottom: "15px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "5px",
                        }}
                      >
                        <Text>{item.period}</Text>
                        <Text strong style={{ color: "#52c41a" }}>
                          {formatCurrency(item.revenue)}
                        </Text>
                      </div>
                      <Progress
                        percent={safePercent(
                          item.revenue,
                          timeData.map((d) => d.revenue)
                        )}
                        strokeColor="#52c41a"
                        showInfo={false}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Bảng sản phẩm bán chạy */}
          <Card
            title={
              <>
                <TrophyOutlined /> Sản Phẩm Bán Chạy - {selectedCategoryName} (
                {topProducts.length} sản phẩm)
              </>
            }
          >
            <Table
              columns={topProductsColumns}
              dataSource={topProducts}
              rowKey={(record, index) => `${record.id}-${index}`}
              pagination={false}
              size="middle"
            />
          </Card>
        </>
      ) : (
        <Card>
          <Empty
            description="Vui lòng chọn danh mục để xem thống kê"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}
    </div>
  );
};

export default CategoryStatistics;
