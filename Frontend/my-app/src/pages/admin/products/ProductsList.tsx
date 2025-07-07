// src/pages/admin/products/ProductList.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct, getProductVariants } from "../../../api/product";
import { Product, ProductVariant } from "../../../types/ProductType"; // Import Product và ProductVariant interface
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
  const [products, setProducts] = useState<Product[]>([]); // Sử dụng Product interface
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
  
      const productsData: Product[] = res.data;

      // Tính toán tổng tồn kho từ productVariants 
      const productsWithStock = await Promise.all(
        productsData.map(async (product) => {
          try {
            const variantsRes = await getProductVariants(product.id);
            const totalStock = variantsRes.data.reduce((sum, variant) => sum + variant.stock_quantity, 0);
            return { ...product, total_stock: totalStock };
          } catch (error) {
            console.error(`Error fetching variants for product ${product.id}:`, error);
            return { ...product, total_stock: 0 }; // Default to 0 if variants fail to load
          }
        })
      );
      setProducts(productsWithStock);

    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm.");
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => { // id là number
    try {
      await deleteProduct(id);
      message.success("Đã xoá sản phẩm thành công");
      fetchData(); // Tải lại dữ liệu sau khi xóa
    } catch (error) {
      message.error("Không thể xoá sản phẩm.");
      console.error("Delete product error:", error);
    }
  };

  const filtered = products.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case "active":
        return "green";
      case "out_of_stock":
        return "red";
      case "inactive":
        return "default"; 
      default:
        return "default";
    }
  };

  const getStockTag = (totalStock: number) => {
    if (totalStock === 0) return <Tag color="red">Hết hàng</Tag>;
    if (totalStock <= 10) return <Tag color="orange">Sắp hết ({totalStock})</Tag>; // Thêm số lượng cụ thể
    return <Tag color="green">Còn hàng ({totalStock})</Tag>;
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text: number) => `#${text}`,
    },
    {
      title: "Ảnh chính",
      dataIndex: "main_image", // Sử dụng main_image
      key: "main_image",
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
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      render: (text: number) => `${text.toLocaleString()} VND`,
    },
    {
      title: "Giá cũ", // Thêm cột giá cũ
      dataIndex: "old_price",
      key: "old_price",
      render: (text: number | null) => text ? `${text.toLocaleString()} VND` : "-",
    },
    {
      title: "Danh mục ID", // Hiện tại chỉ hiển thị ID, cần API để lấy tên danh mục
      dataIndex: "category_id",
      key: "category_id",
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_: any, record: Product) => (
        <Tag color={getStatusColor(record.status)}>
          {record.status === "active" ? "Đang bán" : record.status === "out_of_stock" ? "Hết hàng" : "Ngừng bán"}
        </Tag>
      ),
    },
    {
      // Lưu ý: Trường total_stock này không có sẵn trong db.json products,
      title: "Tổng tồn kho",
      dataIndex: "total_stock",
      key: "total_stock",
      render: (totalStock: number) => getStockTag(totalStock),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Product) => (
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