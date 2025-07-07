import React, { useEffect, useState } from "react";
import { getOrders, deleteOrder } from "../../../api/order";

import { Order } from "../../../types/ProductType";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Popconfirm,
  Space,
  message,
  Typography,
  Tag,
  Input,
} from "antd";

import {
  getOrderStatusColor,
  getOrderStatusText,
} from "../../../utils/orderStatus";

const { Title } = Typography;
const { Search } = Input;

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
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

  const handleDelete = async (id: number) => {
    try {
      await deleteOrder(id);
      message.success("Đã xoá đơn hàng thành công");
      fetchData();
    } catch (error) {
      message.error("Không thể xoá đơn hàng.");
      console.error("Delete order error:", error);
    }
  };

  const filtered = orders.filter(
    (item) =>
      item.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toString().includes(search)
  );

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      render: (text: number) => `#${text}`,
    },
    { title: "Khách hàng", dataIndex: "customer_name", key: "customer_name" },
    {
      title: "Tổng cộng",
      dataIndex: "final_amount",
      key: "final_amount",
      render: (text: number) => `${text.toLocaleString()} VND`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: Order["status"]) => (
        <Tag color={getOrderStatusColor(status)}>
          {getOrderStatusText(status)}
        </Tag>
      ),
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
          <Button onClick={() => navigate(`/admin/orders/detail/${record.id}`)}>
            Xem
          </Button>
          <Button onClick={() => navigate(`/admin/orders/edit/${record.id}`)}>
            Sửa
          </Button>
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
        <Search
          placeholder="Tìm theo mã đơn hoặc khách hàng..."
          onChange={(e) => setSearch(e.target.value)}
          enterButton
        />
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
