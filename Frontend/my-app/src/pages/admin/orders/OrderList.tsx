import React, { useEffect, useState } from "react";
import { getOrders, deleteOrder } from "../../../api/order";
import { useNavigate } from "react-router-dom";
import { Table, Button, Popconfirm, Space, message, Typography, Badge, Input, Tag } from "antd";

const { Title } = Typography;
const { Search } = Input;

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    const res = await getOrders();
    setOrders(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteOrder(id);
    message.success("Đã xoá đơn hàng");
    fetchData();
  };

  const filtered = orders.filter((item: any) =>
    item.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (status: string) => {
    switch (status) {
      case "Chờ xác nhận": return "default";
      case "Đã xác nhận": return "processing";
      case "Đang giao": return "warning";
      case "Đã giao": return "success";
      case "Đã huỷ": return "error";
      default: return "default";
    }
  };

  const columns = [
    { title: "Mã đơn", dataIndex: "id", key: "id" },
    { title: "Khách hàng", dataIndex: "customer_name", key: "customer_name" },
    { title: "Tổng tiền", dataIndex: "total", key: "total", render: (text: number) => `${text.toLocaleString()} VND` },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={statusColor(status)}>{status}</Tag>
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
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
        <Search placeholder="Tìm theo khách hàng..." onChange={(e) => setSearch(e.target.value)} enterButton />
      </Space>
      <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 6 }} />
    </div>
  );
}

