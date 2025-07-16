// src/pages/admin/orders/OrderList.tsx

import React, { useEffect, useState } from "react";
import { getOrders, updateOrder, deleteOrder } from "../../../api/order";
import { Order } from "../../../types/ProductType"; 
import { useNavigate } from "react-router-dom";
import { Table, Button, Popconfirm, Space, message, Typography, Input, Tag, Select } from "antd";

// Import các hàm helper và OPTIONS (không còn icon)
import { 
    getOrderStatusColor, 
    getOrderStatusText, 
    getPaymentStatusColor, 
    getPaymentStatusText,
    ORDER_STATUS_OPTIONS, 
    PAYMENT_STATUS_OPTIONS 
} from "../../../utils/orderStatus"; 

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function OrderList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getOrders();
            
            let ordersData: Order[] = [];
            if (res.data && Array.isArray(res.data.data)) {
                ordersData = res.data.data;
            } else if (Array.isArray(res.data)) {
                ordersData = res.data;
            } else {
                ordersData = res.data.orders || [];
            }
            setOrders(ordersData);

        } catch (error) {
            message.error("Không thể tải danh sách đơn hàng.");
            console.error("Fetch orders error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
        try {
            await updateOrder(orderId, { status: newStatus });
            message.success(`Cập nhật trạng thái đơn hàng #${orderId} thành ${getOrderStatusText(newStatus)}`);
            fetchData(); 
        } catch (error) {
            message.error(`Không thể cập nhật trạng thái đơn hàng #${orderId}.`);
            console.error("Update order status error:", error);
        }
    };

    const handleUpdatePaymentStatus = async (orderId: number, newIsPaid: boolean | number) => {
        try {
            await updateOrder(orderId, { is_paid: newIsPaid });
            message.success(`Cập nhật trạng thái thanh toán #${orderId} thành ${getPaymentStatusText(newIsPaid)}`);
            fetchData(); 
        } catch (error) {
            message.error(`Không thể cập nhật trạng thái thanh toán #${orderId}.`);
            console.error("Update payment status error:", error);
        }
    };


    const filtered = orders.filter((item) =>
        item.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.id?.toString().includes(search)
    );

    const columns = [
        { title: "Mã đơn", dataIndex: "id", key: "id", render: (text: number) => `#${text}` },
        { title: "Mã Khách hàng", dataIndex: "user_id", key: "user_id" },
        {
            title: "Tổng cộng",
            dataIndex: "total_amount", 
            key: "total_amount",
            render: (text: number | undefined | null) => {
                if (text === undefined || text === null) {
                    return '-'; 
                }
                return `${text.toLocaleString()} VND`;
            }
        },
        {
            title: "Phí vận chuyển",
            dataIndex: "shipping_fee",
            key: "shipping_fee",
            render: (text: number | undefined | null) => {
                if (text === undefined || text === null) {
                    return '-';
                }
                return `${text.toLocaleString()} VND`;
            }
        },
        {
            title: "Trạng thái thanh toán",
            dataIndex: "is_paid", 
            key: "is_paid",
            render: (isPaid: boolean | number, record: Order) => (
                <Select
                    value={isPaid} 
                    style={{ width: 150 }}
                    onChange={(value: boolean) => handleUpdatePaymentStatus(record.id, value)}
                >
                    {PAYMENT_STATUS_OPTIONS.map(option => (
                        <Option 
                            key={option.value.toString()} 
                            value={option.value}
                            // Logic vô hiệu hóa: Nếu đã thanh toán (true), không thể chọn 'Chưa thanh toán' (false)
                            disabled={record.is_paid === true && option.value === false}
                        >
                            {option.label}
                        </Option>
                    ))}
                </Select>
            )
        },
        {
            title: "Trạng thái đơn hàng",
            dataIndex: "status",
            key: "status",
            render: (status: Order['status'], record: Order) => {
                // Tìm index của trạng thái hiện tại trong danh sách options
                const currentStatusIndex = ORDER_STATUS_OPTIONS.findIndex(opt => opt.value === record.status);

                return (
                    <Select
                        value={status} 
                        style={{ width: 180 }}
                        onChange={(value: Order['status']) => handleUpdateOrderStatus(record.id, value)}
                    >
                        {ORDER_STATUS_OPTIONS.map((option, index) => {
                            // Logic vô hiệu hóa cho trạng thái đơn hàng
                            let isDisabled = false;

                            // 1. Không thể quay lại trạng thái trước đó trong luồng chính
                            if (index < currentStatusIndex) {
                                // Cho phép chọn 'cancelled' từ các trạng thái trước 'delivered'
                                if (option.value === 'cancelled' && currentStatusIndex <= ORDER_STATUS_OPTIONS.findIndex(opt => opt.value === 'shipping')) {
                                    isDisabled = false; // Vẫn cho phép hủy
                                } else {
                                    isDisabled = true; // Vô hiệu hóa
                                }
                            }

                            // 2. Nếu đã 'delivered' hoặc 'completed' hoặc 'cancelled', không thể thay đổi nữa (trừ 'completed' từ 'delivered')
                            if (record.status === 'delivered' && option.value !== 'completed' && option.value !== 'delivered') {
                                isDisabled = true;
                            }
                            if (record.status === 'completed' && option.value !== 'completed') {
                                isDisabled = true;
                            }
                            if (record.status === 'cancelled' && option.value !== 'cancelled') {
                                isDisabled = true;
                            }

                            return (
                                <Option 
                                    key={option.value} 
                                    value={option.value}
                                    disabled={isDisabled}
                                >
                                    {option.label}
                                </Option>
                            );
                        })}
                    </Select>
                );
            }
        },
        {
            title: "Ngày đặt",
            dataIndex: "created_at",
            key: "created_at",
            render: (text: string) => new Date(text).toLocaleString(),
        },
        {
            title: "Hành động",
            key: "action",
            render: (_: any, record: Order) => (
                <Space size="middle">
                    <Button onClick={() => navigate(`/admin/orders/detail/${record.id}`)}>Xem</Button>
                    
                    {/* Nút Hủy đơn hàng */}
                    {/* Chỉ hiển thị nút Hủy nếu trạng thái chưa phải là 'delivered', 'completed' hoặc 'cancelled' */}
                    {/* {record.status !== 'delivered' && record.status !== 'completed' && record.status !== 'cancelled' && (
                        <Popconfirm
                            title="Bạn có chắc chắn muốn hủy đơn hàng này?"
                            onConfirm={() => handleUpdateOrderStatus(record.id, 'cancelled')} 
                            okText="Hủy"
                            cancelText="Không"
                        >
                            <Button type="default" danger>Hủy</Button> 
                        </Popconfirm>
                    )} */}

                </Space>
            ),
        },
    ];

    return (
        <div>
            <Title level={3}>Quản lý đơn hàng</Title>
            <Space direction="vertical" style={{ marginBottom: 16, width: "100%" }}>
                <Search placeholder="Tìm theo mã đơn hoặc khách hàng..." onChange={(e) => setSearch(e.target.value)} enterButton />
            </Space>
            <Table 
                columns={columns} 
                dataSource={filtered} 
                rowKey="id" 
                loading={loading} 
                pagination={{ pageSize: 6 }} 
            />
        </div>
    );
}
