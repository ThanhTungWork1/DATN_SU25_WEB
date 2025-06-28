import React, { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../../../api/product";
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

const { Title } = Typography;
const { Search } = Input;

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    const res = await getProducts();
    setProducts(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    message.success("Đã xoá sản phẩm");
    fetchData();
  };

  const filtered = products.filter((item: any) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
        { title: "Tên", dataIndex: "name", key: "name" },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (url: string) => (
        <img
          src={url || "https://via.placeholder.com/50"}
          alt="ảnh sản phẩm"
          style={{
            width: 50,
            height: 50,
            objectFit: "cover",
            borderRadius: 4,
            border: "1px solid #eee",
          }}
        />
      ),
    },

     {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (text: number | string) => `${Number(text).toLocaleString()} VND`,
    },
   
    {
      title: "Trạng thái",
      key: "status",
      render: (_: any, record: any) => {
        return (
          <Tag color={record.status ? "green" : "red"}>
            {record.status ? "Còn hàng" : "Hết hàng"}
          </Tag>
        );
      },
    },
    {
      title: "Tồn kho",
      key: "quantity",
      render: (_: any, record: any) => {
        const { quantity } = record;
        if (quantity === 0) return <Tag color="red">Hết kho</Tag>;
        if (quantity <= 4) return <Tag color="gold">Sắp hết</Tag>;
        return <Tag color="blue">Còn nhiều</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button onClick={() => navigate(`/admin/products/edit/${record.id}`)}>
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
      <Title level={3}>Danh sách sản phẩm</Title>
      <Space direction="vertical" style={{ marginBottom: 16, width: "100%" }}>
        <Button
          type="primary"
          onClick={() => navigate("/admin/products/create")}
        >
          Thêm mới
        </Button>
        <Search
          placeholder="Tìm kiếm theo tên..."
          onChange={(e) => setSearch(e.target.value)}
          enterButton
        />
      </Space>
      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}
