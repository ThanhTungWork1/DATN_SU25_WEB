import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders, updateOrder } from "../../../api/order";
import { Order } from "../../../types/ProductType"; 
import {
  Table,
  Button,
  Space,
  message,
  Typography,
  Input,
  Select
} from "antd";
import type { TableProps } from "antd";
import { 
    ORDER_STATUS_OPTIONS, 
    PAYMENT_STATUS_OPTIONS 
} from "../../../utils/orderStatus"; 

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

    const fetchData = async (page = 1, search = "") => {
        setLoading(true);
        try {
            // Giả sử hàm getOrders của bạn có thể nhận tham số
            const res = await getOrders({ page, search }); 
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

    // Gọi lại API mỗi khi từ khóa tìm kiếm (đã được debounce) hoặc trang thay đổi
    useEffect(() => {
        fetchData(pagination.currentPage, debouncedSearchTerm);
    }, [debouncedSearchTerm, pagination.currentPage]);


    const handleUpdateStatus = async (orderId: number, field: 'status' | 'is_paid', value: any) => {
        let payload = { [field]: value };
        if (field === 'is_paid') {
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
        { title: "Mã đơn", dataIndex: "id", key: "id", render: (text) => `#${text}` },
        { title: "Khách hàng", dataIndex: "customer_name", key: "customer_name" },
        { title: "Ngày đặt", dataIndex: "created_at", key: "created_at", render: (text) => new Date(text).toLocaleDateString() },
        { title: "Số lượng", dataIndex: "total_quantity", key: "total_quantity", render: (qty) => `${qty} Sản phẩm` },
        { title: "Tổng tiền", dataIndex: "final_amount", key: "final_amount", render: (text) => `${Number(text).toLocaleString()} VND` },
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
            render: (isPaid, record) => (
                <Select
                    value={!!isPaid} 
                    style={{ width: 150 }}
                    onChange={(value) => handleUpdateStatus(record.id, 'is_paid', value)}
                    disabled={!!isPaid}
                >
                    {PAYMENT_STATUS_OPTIONS.map(option => <Option key={String(option.value)} value={option.value}>{option.label}</Option>)}
                </Select>
            )
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
            <Search 
                placeholder="Tìm theo mã đơn hoặc tên khách hàng..." 
                onChange={(e) => setSearchTerm(e.target.value)}
                enterButton 
                style={{ marginBottom: 16, width: 400 }}
            />
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
