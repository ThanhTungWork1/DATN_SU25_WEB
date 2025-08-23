import React from 'react';
import "../../../assets/styles/admin-responsive.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders, updateOrder, getOrderStatistics } from "../../../api/order";
import { Order } from "../../../types/ProductType";
import {
  Table,
  Button,
  Space,
  message,
  Typography,
  Input,
  Select,
  DatePicker,
  Card,
  Row,
  Col,
  Statistic,
  Tooltip,
} from "antd";
import type { TableProps } from "antd";
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  getPaymentStatusDisplayText,
} from "../../../utils/orderStatus";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import CancelledOrderPaymentStatus from "../../../components/CancelledOrderPaymentStatus";
import {
  formatCurrency,
  formatCurrencyWithColor,
} from "../../../utils/currencyFormatter";
import { formatDateVietnam } from "../../../utils/dateFormatter";
import {
  canChangePaymentStatus,
  canChangeOrderStatus,
  getAllowedPaymentStatuses,
  getAllowedOrderStatuses,
  shouldAutoUpdatePayment,
} from "../../../utils/orderBusinessLogic";

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

// Định nghĩa kiểu cho phản hồi phân trang từ Laravel
interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  total: number;
  per_page: number;
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 15, // Mặc định khớp với backend
    total: 0,
  });

  // Sử dụng Debounce để tránh gọi API liên tục khi người dùng đang gõ
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Gửi request sau 500ms ngừng gõ

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchData = async (
    page = 1,
    search = "",
    status = "",
    isPaid = "",
    dateFrom = "",
    dateTo = ""
  ) => {
    setLoading(true);
    try {
      const params: any = { page, search };
      if (status) params.status = status;
      if (isPaid !== "") params.is_paid = isPaid;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const res = await getOrders(params);

      const paginatedData: PaginatedResponse<Order> = res.data;

      setOrders(paginatedData.data);
      setPagination({
        currentPage: paginatedData.current_page,
        pageSize: paginatedData.per_page,
        total: paginatedData.total,
      });
    } catch (error) {
      message.error("Không thể tải danh sách đơn hàng.");
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    setStatsLoading(true);
    try {
      const res = await getOrderStatistics();
      setStatistics(res.data);
    } catch (error) {
      console.error("Fetch statistics error:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const columns: TableProps<Order>["columns"] = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      render: (text) => `#${text}`,
    },
    {
      title: "Khách hàng",
      dataIndex: "customer_name",
      key: "customer_name",
      render: (text, record) => {
        console.log("🔍 [FRONTEND DEBUG] Order ID:", record.id);
        console.log("🔍 [FRONTEND DEBUG] Customer name:", text);
        console.log("🔍 [FRONTEND DEBUG] Full order record:", record);
        return text || "Không có tên";
      },
    },
    {
      title: "Ngày đặt",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Số lượng",
      dataIndex: "total_quantity",
      key: "total_quantity",
      render: (qty) => `${qty} Sản phẩm`,
    },
    {
      title: "Tổng tiền",
      key: "total_price",
      render: (_, record) => {
        const finalAmount =
          record.final_amount ||
          record.total_amount +
            record.shipping_fee -
            (record.discount_amount || 0);
        // Dùng formatter để tự động nhân 1000 và format VND
        return formatCurrency(finalAmount);
      },
    },
    {
      title: "Trạng thái ĐH",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        // Lấy danh sách trạng thái được phép (có disable workflow)
        const allowedStatuses = getAllowedOrderStatuses(
          record.is_paid,
          record.payment_method || "COD",
          record.status // Pass current status để disable previous
        );

        return (
          <Select
            value={status}
            style={{ width: 150 }}
            onChange={async (newStatus) => {
              // Validate business logic trước khi update
              const validation = canChangeOrderStatus(
                record.status,
                record.is_paid,
                newStatus,
                record.payment_method || "COD"
              );

              if (!validation.allowed) {
                message.error(validation.reason);
                return;
              }

              // Check auto-update payment status
              const autoPayment = shouldAutoUpdatePayment(
                record.status,
                newStatus,
                record.payment_method || "COD"
              );

              // Update order status
              await handleUpdateStatus(record.id, "status", newStatus);

              // Auto-update payment status if needed
              if (autoPayment.shouldUpdate) {
                setTimeout(async () => {
                  await handleUpdateStatus(
                    record.id,
                    "is_paid",
                    autoPayment.newPaymentStatus
                  );
                  message.success(autoPayment.reason);
                }, 500); // Delay để order status update trước
              }
            }}
          >
            {ORDER_STATUS_OPTIONS.map((option) => (
              <Option
                key={option.value}
                value={option.value}
                disabled={!allowedStatuses.includes(option.value)}
                style={{
                  color: !allowedStatuses.includes(option.value)
                    ? "#ccc"
                    : "inherit",
                }}
              >
                {option.label}
                {!allowedStatuses.includes(option.value) && " (Không khả dụng)"}
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: "Trạng thái TT",
      dataIndex: "is_paid",
      key: "is_paid",
      render: (is_paid, record) => {
        // Nếu là đơn đã huỷ, hiển thị logic chuyên biệt
        if (record.status === "cancelled") {
          return (
            <CancelledOrderPaymentStatus
              isPaid={is_paid}
              paymentMethod={record.payment_method || "COD"}
            />
          );
        }

        // Các trạng thái khác: giữ nguyên logic cũ
        const allowedPaymentStatuses = getAllowedPaymentStatuses(
          record.status,
          record.payment_method || "COD"
        );
        const displayValue = getPaymentStatusDisplayText(is_paid);

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                backgroundColor: is_paid ? "#f6ffed" : "#fff2e8",
                color: is_paid ? "#52c41a" : "#fa8c16",
                border: `1px solid ${is_paid ? "#b7eb8f" : "#ffbb96"}`,
                fontSize: 12,
                fontWeight: 500,
                minWidth: 100,
                textAlign: "center",
              }}
            >
              {displayValue}
            </span>
            <Select
              value={null}
              placeholder="Thay đổi"
              style={{ width: 100 }}
              size="small"
              onChange={(newPaymentStatus) => {
                const validation = canChangePaymentStatus(
                  record.status,
                  record.is_paid,
                  newPaymentStatus,
                  record.payment_method || "COD"
                );
                if (!validation.allowed) {
                  message.error(validation.reason);
                  return;
                }
                handleUpdateStatus(record.id, "is_paid", newPaymentStatus);
              }}
              allowClear
            >
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <Option
                  key={option.value}
                  value={option.value}
                  disabled={
                    !allowedPaymentStatuses.includes(option.value) ||
                    option.value === is_paid
                  }
                  style={{
                    color:
                      !allowedPaymentStatuses.includes(option.value) ||
                      option.value === is_paid
                        ? "#ccc"
                        : "inherit",
                  }}
                >
                  {option.label}
                  {!allowedPaymentStatuses.includes(option.value) &&
                    " (Không khả dụng)"}
                  {option.value === is_paid && " (Hiện tại)"}
                </Option>
              ))}
            </Select>
          </div>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/admin/orders/detail/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Gọi lại API mỗi khi từ khóa tìm kiếm (đã được debounce) hoặc trang thay đổi
  useEffect(() => {
    fetchData(
      pagination.currentPage,
      debouncedSearchTerm,
      statusFilter,
      paymentFilter,
      dateRange ? dateRange[0] : "",
      dateRange ? dateRange[1] : ""
    );
  }, [
    debouncedSearchTerm,
    pagination.currentPage,
    statusFilter,
    paymentFilter,
    dateRange,
  ]);

  // Load statistics khi component mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleUpdateStatus = async (
    orderId: number,
    field: "status" | "is_paid",
    value: any
  ) => {
    let payload = { [field]: value };
    if (field === "is_paid") {
      // Chuyển đổi boolean thành 0/1 cho backend
      payload = { [field]: value ? 1 : 0 };
    }

    try {
      await updateOrder(orderId, payload);
      message.success(`Cập nhật đơn hàng #${orderId} thành công`);
      fetchData(pagination.currentPage, debouncedSearchTerm);
    } catch (error: any) {
      message.error(`Không thể cập nhật đơn hàng #${orderId}.`);
      console.error("Update status error:", error.response?.data || error);
    }
  };

  const handleTableChange: TableProps<Order>["onChange"] = (
    paginationConfig
  ) => {
    // Cập nhật state của trang hiện tại, useEffect sẽ tự động gọi lại fetchData
    setPagination((prev) => ({
      ...prev,
      currentPage: paginationConfig.current ?? 1,
    }));
  };

  return (
    <div>
      <Title level={3}>Quản lý đơn hàng</Title>

      {/* Statistics Cards */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="Tổng đơn hàng"
                value={statistics.total}
                loading={statsLoading}
                suffix="đơn"
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Chờ xác nhận"
                value={statistics.pending_confirmation}
                valueStyle={{ color: "#faad14" }}
                loading={statsLoading}
                suffix="đơn"
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Đang xử lý"
                value={statistics.processing}
                valueStyle={{ color: "#1890ff" }}
                loading={statsLoading}
                suffix="đơn"
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Đã giao"
                value={statistics.delivered}
                valueStyle={{ color: "#52c41a" }}
                loading={statsLoading}
                suffix="đơn"
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Đã thanh toán"
                value={statistics.paid}
                valueStyle={{ color: "#52c41a" }}
                loading={statsLoading}
                suffix="đơn"
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Đã hủy"
                value={statistics.cancelled}
                valueStyle={{ color: "#ff4d4f" }}
                loading={statsLoading}
                suffix="đơn"
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500, color: "#333" }}>
              Tìm kiếm
            </div>
            <Search
              placeholder="Tìm theo order code, tên, email, SĐT..."
              onChange={(e) => setSearchTerm(e.target.value)}
              enterButton
            />
          </div>
        </Col>
        <Col span={4}>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500, color: "#333" }}>
              Trạng thái đơn hàng
            </div>
            <Select
              placeholder="Chọn trạng thái"
              style={{ width: "100%" }}
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Col>
        <Col span={4}>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500, color: "#333" }}>
              Trạng thái thanh toán
            </div>
            <Select
              placeholder="Chọn trạng thái"
              style={{ width: "100%" }}
              allowClear
              value={paymentFilter}
              onChange={setPaymentFilter}
            >
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Col>
        <Col span={6}>
          <div>
            <div style={{ marginBottom: 4, fontWeight: 500, color: "#333" }}>
              Khoảng thời gian
            </div>
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              placeholder={["Từ ngày", "Đến ngày"]}
              onChange={(dates) => {
                if (dates) {
                  setDateRange([
                    dates[0]?.format("YYYY-MM-DD") || "",
                    dates[1]?.format("YYYY-MM-DD") || "",
                  ]);
                } else {
                  setDateRange(null);
                }
              }}
            />
          </div>
        </Col>
        <Col span={4}>
          <div style={{ marginTop: 24 }}>
            <Space>
              <Tooltip title="Làm mới">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("");
                    setPaymentFilter("");
                    setDateRange(null);
                    fetchStatistics();
                  }}
                />
              </Tooltip>
            </Space>
          </div>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.currentPage,
          pageSize: pagination.pageSize,
          total: pagination.total,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
}
