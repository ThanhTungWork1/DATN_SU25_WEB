import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../../../api/product";
import { getCategories } from "../../../api/category";
import { Product, Category } from "../../../types/ProductType";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- SỬA LỖI: Logic tìm kiếm với Debounce ---
  const [searchTerm, setSearchTerm] = useState(""); // State cho từ khóa người dùng nhập
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // State cho từ khóa sẽ được gửi đi

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    total: 0,
  });

  // Sử dụng Debounce để tránh gọi API liên tục khi người dùng đang gõ
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Gửi request sau 500ms ngừng gõ

    // Hủy timeout nếu người dùng tiếp tục gõ
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchData = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const productsRes = await getProducts({ page, search, per_page: pagination.pageSize });
      console.log("🔍 [DEBUG] API response:", productsRes);
      const paginatedData = (productsRes as any).data as PaginatedResponse<Product>;
      console.log("🔍 [DEBUG] Paginated data:", paginatedData);
      console.log("🔍 [DEBUG] Products:", paginatedData.data);

      if (categories.length === 0) {
        const categoriesRes = await getCategories();
        const categoriesData = (categoriesRes as any).data as Category[]; // API trả mảng thuần
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      }

      setProducts(paginatedData.data);
      setPagination((prev) => ({
        currentPage: paginatedData.current_page,
        pageSize: paginatedData.per_page || prev.pageSize,
        total: paginatedData.total,
      }));
    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm.");
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi lại API mỗi khi từ khóa tìm kiếm (đã được debounce) hoặc trang thay đổi
  useEffect(() => {
    fetchData(pagination.currentPage, debouncedSearchTerm);
  }, [debouncedSearchTerm, pagination.currentPage]);

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      message.success("Đã xoá sản phẩm thành công");
      fetchData(pagination.currentPage, debouncedSearchTerm);
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

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Không rõ";
  };

  const columns: TableProps<Product>["columns"] = [
    { title: "ID", dataIndex: "id", key: "id", render: (text) => `#${text}` },
    {
      title: "Ảnh",
      dataIndex: "image_url",
      key: "image",
      render: (url: string, record: any) => {
        console.log(
          "🔍 [DEBUG] Rendering image for product:",
          record.id,
          "URL:",
          url
        );
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
            onError={(e) => {
              console.error("🔍 [DEBUG] Image failed to load:", url, e);
            }}
            onLoad={() => {
              console.log("🔍 [DEBUG] Image loaded successfully:", url);
            }}
          />
        );
      },
    },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      render: (text) => `${(Number(text) * 1000).toLocaleString("vi-VN")}₫`,
    },
    {
      title: "Danh mục",
      dataIndex: "category_id",
      key: "category_id",
      render: (catId) => getCategoryName(catId),
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
          // SỬA LẠI: Dùng onChange để tìm kiếm khi người dùng gõ
          onChange={(e) => setSearchTerm(e.target.value)}
          enterButton
        />
      </Space>
      <Table
        columns={columns}
        dataSource={products}
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
