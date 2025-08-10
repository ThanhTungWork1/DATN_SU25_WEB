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
  // State này sẽ lưu trữ từ khóa tìm kiếm cuối cùng, sau khi đã được "debounced"
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5,
    total: 0,
  });

  // State này sẽ lưu trữ từ khóa tìm kiếm đã được "debounced"
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

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
      const productsRes = await getProducts({ page, search });
      console.log("🔍 [DEBUG] API response:", productsRes);
      const paginatedData: PaginatedResponse<Product> = productsRes.data;
      console.log("🔍 [DEBUG] Paginated data:", paginatedData);
      console.log("🔍 [DEBUG] Products:", paginatedData.data);

      if (categories.length === 0) {
        const categoriesRes = await getCategories();
        const categoriesData: Category[] = Array.isArray(
          categoriesRes.data.data
        )
          ? categoriesRes.data.data
          : categoriesRes.data;
        setCategories(categoriesData);
      }

      setProducts(paginatedData.data);
      setPagination({
        currentPage: paginatedData.current_page,
        pageSize: paginatedData.per_page,
        total: paginatedData.total,
      });
    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm.");
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect này sẽ tự động gọi API mỗi khi searchTerm (đã debounced) hoặc trang thay đổi
  useEffect(() => {
    fetchData(pagination.currentPage, searchTerm);
  }, [searchTerm, pagination.currentPage]);

  // --- SỬA ĐỔI: Thêm logic "debouncing" cho việc tìm kiếm ---
  const [inputValue, setInputValue] = useState(''); // State để lưu giá trị gõ vào ngay lập tức
  
  useEffect(() => {
      // Thiết lập một bộ đếm thời gian
      const timer = setTimeout(() => {
          // Sau 500ms không gõ nữa, cập nhật searchTerm thật
          setSearchTerm(inputValue);
          // và quay về trang 1
          setPagination(prev => ({ ...prev, currentPage: 1 }));
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
      render: (text) => `${Number(text).toLocaleString("vi-VN")}₫`,
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
          // SỬA ĐỔI: Dùng onChange để tìm kiếm ngay khi gõ
          onChange={(e) => setInputValue(e.target.value)}
          enterButton
          allowClear
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
