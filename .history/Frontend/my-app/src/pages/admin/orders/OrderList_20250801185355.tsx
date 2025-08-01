import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders, updateOrder, getOrderStatistics, exportOrders } from "../../../api/order";
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
  Tooltip
} from "antd";
import type { TableProps } from "antd";
import { 
    ORDER_STATUS_OPTIONS, 
    PAYMENT_STATUS_OPTIONS 
} from "../../../utils/orderStatus";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import CancelledOrderPaymentStatus from "../../../components/CancelledOrderPaymentStatus"; 

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

    const fetchData = async (page = 1, search = "", status = "", isPaid = "", dateFrom = "", dateTo = "") => {
        setLoading(true);
        try {
            console.log("🔍 [FRONTEND DEBUG] Fetching orders with filters:", { page, search, status, isPaid, dateFrom, dateTo });
            
            const params: any = { page, search };
            if (status) params.status = status;
            if (isPaid !== "") params.is_paid = isPaid;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;
            
            const res = await getOrders(params); 
            console.log("🔍 [FRONTEND DEBUG] Raw API response:", res);
            
            const paginatedData: PaginatedResponse<Order> = res.data;
            console.log("🔍 [FRONTEND DEBUG] Paginated data:", paginatedData);
            console.log("🔍 [FRONTEND DEBUG] Orders array:", paginatedData.data);
            
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

    const handleExport = async () => {
        try {
            const params: any = {};
            if (debouncedSearchTerm) params.search = debouncedSearchTerm;
            if (statusFilter) params.status = statusFilter;
            if (paymentFilter !== "") params.is_paid = paymentFilter;
            
            const res = await exportOrders(params);
            
            // Tạo download link
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            message.success("Xuất file thành công!");
        } catch (error) {
            message.error("Không thể xuất file.");
            console.error("Export error:", error);
        }
    };

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
    }, [debouncedSearchTerm, pagination.currentPage, statusFilter, paymentFilter, dateRange]);

    // Load statistics khi component mount
    useEffect(() => {
        fetchStatistics();
    }, []);


    const handleUpdateStatus = async (orderId: number, field: 'status' | 'is_paid', value: any) => {
        let payload = { [field]: value };
        if (field === 'is_paid') {
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

    const handleTableChange: TableProps<Order>['onChange'] = (paginationConfig) => {
        // Cập nhật state của trang hiện tại, useEffect sẽ tự động gọi lại fetchData
        setPagination(prev => ({ ...prev, currentPage: paginationConfig.current ?? 1 }));
    };

    const columns: TableProps<Order>['columns'] = [
        { 
            title: "Mã đơn", 
            dataIndex: "order_code", 
            key: "order_code", 
            render: (text, record) => {
                if (text) {
                    return <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{text}</span>;
                }
                // Nếu không có order_code, hiển thị ID nhưng với style nhạt hơn
                return <span style={{ color: '#999', fontSize: '12px' }}>#{record.id}</span>;
            }
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
            }
        },
        { title: "Ngày đặt", dataIndex: "created_at", key: "created_at", render: (text) => new Date(text).toLocaleDateString() },
        { 
            title: "Số lượng", 
            dataIndex: "total_quantity", 
            key: "total_quantity", 
            render: (qty) => {
                const quantity = Number(qty) || 0;
                if (quantity === 0) {
                    return <span style={{color: '#999'}}>0 sản phẩm</span>;
                }
                return `${quantity} Sản phẩm`;
            }
        },
        { 
            title: "Tổng tiền", 
            dataIndex: "calculated_final_amount", 
            key: "calculated_final_amount", 
            render: (text, record) => {
                console.log("🔍 [FRONTEND DEBUG] Order ID:", record.id);
                console.log("🔍 [FRONTEND DEBUG] Calculated final amount:", text);
                console.log("🔍 [FRONTEND DEBUG] Full record:", record);
                const amount = Number(text) || 0;
                return `${amount.toLocaleString()} VND`;
            }
        },
        {
            title: "Trạng thái ĐH",
            dataIndex: "status",
            key: "status",
            render: (status, record) => {
                const currentStatusIndex = ORDER_STATUS_OPTIONS.findIndex(opt => opt.value === record.status);

                // Nếu đơn hàng đã hoàn thành hoặc đã hủy, vô hiệu hóa toàn bộ ô chọn
                if (record.status === 'completed' || record.status === 'cancelled') {
                    return (
                        <Select value={status} style={{ width: 180 }} disabled>
                            <Option value={status}>{ORDER_STATUS_OPTIONS.find(o => o.value === status)?.label}</Option>
                        </Select>
                    );
                }

                return (
                    <Select
                        value={status} 
                        style={{ width: 180 }}
                        onChange={(value) => handleUpdateStatus(record.id, 'status', value)}
                    >
                        {ORDER_STATUS_OPTIONS.map((option, index) => {
                            let isDisabled = false;
                            // Vô hiệu hóa các trạng thái trước đó, trừ trạng thái 'cancelled'
                            if (index < currentStatusIndex && option.value !== 'cancelled') {
                                isDisabled = true;
                            }
                            
                            return (
                                <Option key={option.value} value={option.value} disabled={isDisabled}>
                                    {option.label}
                                </Option>
                            );
                        })}
                    </Select>
                );
            }
        },
        {
            title: "Trạng thái TT",
            dataIndex: "is_paid", 
            key: "is_paid",
            render: (isPaid, record) => {
                // Nếu đơn hàng đã hủy, hiển thị thông tin thanh toán với context hủy
                if (record.status === 'cancelled') {
                    return (
                        <CancelledOrderPaymentStatus 
                            isPaid={isPaid} 
                            paymentMethod={record.payment_method} 
                        />
                    );
                }
                
                // Nếu đơn hàng chưa hủy, hiển thị dropdown bình thường
                const isPaidBool = isPaid === true || isPaid === 1 || isPaid === 'paid';
                return (
                    <Select
                        value={isPaidBool} 
                        style={{ width: 150 }}
                        onChange={(value) => handleUpdateStatus(record.id, 'is_paid', value)}
                        disabled={isPaidBool}
                    >
                        {PAYMENT_STATUS_OPTIONS.map(option => <Option key={String(option.value)} value={option.value}>{option.label}</Option>)}
                    </Select>
                );
            }
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Button onClick={() => navigate(`/admin/orders/detail/${record.id}`)}>Xem</Button>
            ),
        },
    ];

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
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card>
                            <Statistic 
                                title="Chờ xác nhận" 
                                value={statistics.pending_confirmation} 
                                valueStyle={{ color: '#faad14' }}
                                loading={statsLoading}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card>
                            <Statistic 
                                title="Đang xử lý" 
                                value={statistics.processing} 
                                valueStyle={{ color: '#1890ff' }}
                                loading={statsLoading}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card>
                            <Statistic 
                                title="Đã giao" 
                                value={statistics.delivered} 
                                valueStyle={{ color: '#52c41a' }}
                                loading={statsLoading}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card>
                            <Statistic 
                                title="Đã thanh toán" 
                                value={statistics.paid} 
                                valueStyle={{ color: '#52c41a' }}
                                loading={statsLoading}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card>
                            <Statistic 
                                title="Đã hủy" 
                                value={statistics.cancelled} 
                                valueStyle={{ color: '#ff4d4f' }}
                                loading={statsLoading}
                            />
                        </Card>
                    </Col>
                </Row>
            )}
            


            {/* Filters */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Search 
                        placeholder="Tìm theo order code, tên, email, SĐT..." 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        enterButton 
                    />
                </Col>
                <Col span={4}>
                    <Select
                        placeholder="Trạng thái đơn hàng"
                        style={{ width: '100%' }}
                        allowClear
                        value={statusFilter}
                        onChange={setStatusFilter}
                    >
                        {ORDER_STATUS_OPTIONS.map(option => (
                            <Select.Option key={option.value} value={option.value}>
                                {option.label}
                            </Select.Option>
                        ))}
                    </Select>
                </Col>
                <Col span={4}>
                    <Select
                        placeholder="Trạng thái thanh toán"
                        style={{ width: '100%' }}
                        allowClear
                        value={paymentFilter}
                        onChange={setPaymentFilter}
                    >
                        <Select.Option value="1">Đã thanh toán</Select.Option>
                        <Select.Option value="0">Chưa thanh toán</Select.Option>
                    </Select>
                </Col>
                <Col span={6}>
                    <DatePicker.RangePicker
                        style={{ width: '100%' }}
                        placeholder={['Từ ngày', 'Đến ngày']}
                        onChange={(dates) => {
                            if (dates) {
                                setDateRange([
                                    dates[0]?.format('YYYY-MM-DD') || '',
                                    dates[1]?.format('YYYY-MM-DD') || ''
                                ]);
                            } else {
                                setDateRange(null);
                            }
                        }}
                    />
                </Col>
                <Col span={4}>
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
                        <Tooltip title="Xuất file CSV">
                            <Button 
                                icon={<DownloadOutlined />} 
                                onClick={handleExport}
                            />
                        </Tooltip>
                    </Space>
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
