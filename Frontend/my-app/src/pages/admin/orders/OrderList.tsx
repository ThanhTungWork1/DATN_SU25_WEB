

import React, { useEffect, useState } from "react";
import { getOrders, deleteOrder } from "../../../api/order";
import { Order } from "../../../types/Order"; 
import { useNavigate } from "react-router-dom";
import { Table, Button, Popconfirm, Space, message, Typography, Tag, Input } from "antd";

const { Title } = Typography;
const { Search } = Input;

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]); // Sử dụng Order interface
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getOrders();
      setOrders(res.data);
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

  const handleDelete = async (id: number) => { // id là number
    try {
      await deleteOrder(id);
      message.success("Đã xoá đơn hàng thành công");
      fetchData(); // Tải lại dữ liệu sau khi xóa
    } catch (error) {
      message.error("Không thể xoá đơn hàng.");
      console.error("Delete order error:", error);
    }
  };

  const filtered = orders.filter((item) =>
    item.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    item.id.toString().includes(search) // Cho phép tìm kiếm theo ID đơn hàng
  );

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case "pending_confirmation": return "default"; 
      case "confirmed": return "blue"; 
      case "processing": return "processing"; 
      case "shipping": return "warning";
      case "delivered": return "success"; 
      case "cancelled": return "error";
      default: return "default";
    }
  };
  
  const getStatusText = (status: Order['status']) => {
      switch (status) {
        case "pending_confirmation": return "Chờ xác nhận";
        case "confirmed": return "Đã xác nhận";
        case "processing": return "Đang xử lý";
        case "shipping": return "Đang giao hàng";
        case "delivered": return "Đã giao hàng";
        case "cancelled": return "Đã huỷ";
        default: return "Không rõ";
      }
  };


  const columns = [
    { title: "Mã đơn", dataIndex: "id", key: "id", render: (text: number) => `#${text}` },
    { title: "Khách hàng", dataIndex: "customer_name", key: "customer_name" },
    {
      title: "Tổng cộng",
      dataIndex: "final_amount", // Sử dụng final_amount
      key: "final_amount",
      render: (text: number) => `${text.toLocaleString()} VND`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: Order['status']) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
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
          <Button onClick={() => navigate(`/admin/orders/edit/${record.id}`)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xoá?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xoá"
            cancelText="Huỷ"
          >
            <Button danger>Xoá</Button>
          </Popconfirm>
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
      <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 6 }} />
    </div>
  );
}