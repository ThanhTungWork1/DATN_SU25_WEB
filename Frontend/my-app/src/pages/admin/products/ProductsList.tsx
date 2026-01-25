import React from "react";
import "../../../assets/styles/admin-responsive.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../../../api/product";
import { Product } from "../../../types/ProductType";
import {
  Table,
  Button,
  Popconfirm,
  Space,
  message,
  Typography,
  Tag,
  Input,
  Tooltip,
} from "antd";
import type { TableProps } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Search } = Input;

// Định nghĩa kiểu cho phản hồi phân trang từ Laravel
interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  total: number;
  per_page: number;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // State này sẽ lưu trữ từ khóa tìm kiếm cuối cùng, sau khi đã được "debounced"
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    total: 0,
  });

  const fetchData = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const productsRes = await getProducts({
        page,
        search,
        per_page: pagination.pageSize,
      });

      // Backend trả về { success: true, data: paginator }
      const responseData = (productsRes as any).data;
      console.log("🔍 ProductsList - API Response:", productsRes);
      console.log("🔍 ProductsList - Response Data:", responseData);

      // Kiểm tra structure mới: responseData.data (wrapper + paginator)
      const paginatedData = responseData?.data;
      console.log("🔍 ProductsList - Paginated Data:", paginatedData);

      // Debug: Kiểm tra category data
      if (paginatedData?.data && paginatedData.data.length > 0) {
        console.log(
          "🔍 ProductsList - First product category:",
          paginatedData.data[0].category
        );
      }

      // Đảm bảo data là array
      const productsArray = Array.isArray(paginatedData?.data)
        ? paginatedData.data
        : [];
      console.log("🔍 ProductsList - Products Array:", productsArray);
      console.log("🔍 ProductsList - Products Count:", productsArray.length);

      setProducts(productsArray);
      setPagination((prev) => ({
        ...prev,
        currentPage: paginatedData?.current_page || 1,
        pageSize: paginatedData?.per_page || prev.pageSize,
        total: paginatedData?.total || 0,
      }));
    } catch (error) {
      console.error("❌ ProductsList - Error:", error);
      message.error("Không thể tải danh sách sản phẩm.");
      // Set empty array để tránh crash
      setProducts([]);
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
        total: 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  // useEffect này sẽ tự động gọi API mỗi khi searchTerm (đã debounced) hoặc trang thay đổi
  useEffect(() => {
    fetchData(pagination.currentPage, searchTerm);
  }, [searchTerm, pagination.currentPage]);

  // --- SỬA ĐỔI: Thêm logic "debouncing" cho việc tìm kiếm ---
  const [inputValue, setInputValue] = useState(""); // State để lưu giá trị gõ vào ngay lập tức

  useEffect(() => {
    // Thiết lập một bộ đếm thời gian
    const timer = setTimeout(() => {
      // Sau 500ms không gõ nữa, cập nhật searchTerm thật
      setSearchTerm(inputValue);
      // và quay về trang 1
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, 500); // Chờ 500 mili giây

    // Hủy bộ đếm thời gian nếu người dùng lại gõ chữ mới
    return () => {
      clearTimeout(timer);
    };
  }, [inputValue]); // useEffect này sẽ chạy lại mỗi khi người dùng gõ một ký tự mới

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      message.success("Đã xoá sản phẩm thành công");
      fetchData(pagination.currentPage, searchTerm);
    } catch (error) {
      message.error("Không thể xoá sản phẩm.");
    }
  };

  const handleTableChange: TableProps<Product>["onChange"] = (
    paginationConfig
  ) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: paginationConfig.current ?? 1,
    }));
  };

  const columns: TableProps<Product>["columns"] = [
    { title: "ID", dataIndex: "id", key: "id", render: (text) => `#${text}` },
    {
      title: "Ảnh",
      dataIndex: "image_url",
      key: "image",
      render: (url: string) => {
        return (
          <img
            src={url || "https://placehold.co/50x50/cccccc/333333?text=N/A"}
            alt="ảnh sản phẩm"
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 4,
            }}
            onError={() => {}}
            onLoad={() => {}}
          />
        );
      },
    },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      render: (text) => `${Number(text).toLocaleString("vi-VN")}₫`,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category) => category?.name || "Không rõ",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Đang bán" : "Ngừng bán"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/products/detail/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/products/edit/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc muốn xoá?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
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
          placeholder="Tìm kiếm theo tên sản phẩm..."
          // SỬA ĐỔI: Dùng onChange để tìm kiếm ngay khi gõ
          onChange={(e) => setInputValue(e.target.value)}
          enterButton
          allowClear
        />
      </Space>
      <Table
        columns={columns}
        dataSource={Array.isArray(products) ? products : []}
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
