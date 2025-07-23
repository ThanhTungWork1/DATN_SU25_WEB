import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProducts,
  deleteProduct,
  getProductVariants,
  getCategories, // Import để lấy danh sách danh mục
} from "../../../api/product";
// Đảm bảo đường dẫn đến Product và ProductVariant là chính xác
import { Product, ProductVariant, Category } from "../../../types/ProductType"; 
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
import { TagProps } from "antd"; 

const { Title } = Typography;
const { Search } = Input;

// Định nghĩa lại Product với trường total_stock được thêm vào
interface ProductWithTotalStock extends Product {
  total_stock?: number;
}

export default function ProductList() {
  const [products, setProducts] = useState<ProductWithTotalStock[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // State để lưu danh mục
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi API để lấy danh sách sản phẩm và danh mục đồng thời
      const [productsRes, categoriesRes] = await Promise.all([
        getProducts(),
        getCategories(), // Lấy danh sách danh mục
      ]);

      // Xử lý dữ liệu danh mục
      const categoriesData: Category[] = Array.isArray(categoriesRes.data.data) ? categoriesRes.data.data : categoriesRes.data;
      setCategories(categoriesData);

      // Xử lý dữ liệu sản phẩm
      const productsData: Product[] = Array.isArray(productsRes.data.data) ? productsRes.data.data : productsRes.data;

      // Tính toán tổng tồn kho từ productVariants cho mỗi sản phẩm
      const productsWithStock = await Promise.all(
        productsData.map(async (product) => {
          try {
            // Lấy biến thể của từng sản phẩm
            const variantsRes = await getProductVariants(product.id);
            const variantsData: ProductVariant[] = Array.isArray(variantsRes.data.data) ? variantsRes.data.data : variantsRes.data;
            
            // Tính tổng tồn kho
            const totalStock = variantsData.reduce(
              (sum, variant) => sum + variant.stock_quantity,
              0
            );
            return { ...product, total_stock: totalStock };
          } catch (error) {
            console.error(
              `Error fetching variants for product ${product.id}:`,
              error
            );
            return { ...product, total_stock: 0 }; // Mặc định là 0 nếu lỗi
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

  const handleDelete = async (id: number) => {
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

  // Hàm lấy màu cho Tag trạng thái sản phẩm (nhận boolean/number)
  const getProductStatusColor = (status: boolean | number): TagProps['color'] => {
    if (status === true || status === 1) {
      return "green"; // Đang bán
    }
    if (status === false || status === 0) {
      return "red"; // Ngừng bán/Hết hàng
    }
    return "default"; // Mặc định
  };

  // Hàm lấy văn bản cho trạng thái sản phẩm (nhận boolean/number)
  const getProductStatusText = (status: boolean | number): string => {
    if (status === true || status === 1) {
      return "Đang bán";
    }
    if (status === false || status === 0) {
      return "Ngừng bán";
    }
    return "Không rõ";
  };

  // Hàm lấy Tag hiển thị tồn kho
  // const getStockTag = (totalStock: number) => {
  //   if (totalStock === 0) return <Tag color="red">Hết hàng</Tag>;
  //   if (totalStock <= 10)
  //     return <Tag color="orange">Sắp hết ({totalStock})</Tag>; 
  //   return <Tag color="blue">Còn hàng ({totalStock})</Tag>;
  // };

  // Hàm để lấy tên danh mục từ category_id
  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Không rõ";
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text: number) => `#${text}`,
    },
     {
      title: "Ảnh",
      // SỬA LỖI TẠI ĐÂY: Dùng 'image_url' thay vì 'image'
      dataIndex: "image_url", 
      key: "image",
      render: (url: string) => (
        <img
          src={url || "https://placehold.co/50x50/cccccc/333333?text=No+Image"}
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
      ellipsis: true, // Hiển thị dấu ba chấm nếu quá dài
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      render: (text: number) => `${text.toLocaleString()} VND`,
    },
    // {
    //   title: "Giá cũ", 
    //   dataIndex: "old_price",
    //   key: "old_price",
    //   render: (text: number | null) =>
    //     text ? `${text.toLocaleString()} VND` : "-", // Hiển thị "-" nếu không có giá cũ
    // },
    {
      title: "Danh mục", 
      dataIndex: "category_id",
      key: "category_id",
      render: (categoryId: number) => getCategoryName(categoryId), // Hiển thị tên danh mục
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_: any, record: Product) => (
        <Tag color={getProductStatusColor(record.status)}>
          {getProductStatusText(record.status)}
        </Tag>
      ),
    },
    // {
    //   title: "Tổng tồn kho",
    //   dataIndex: "total_stock", // Trường này được thêm vào khi fetchData
    //   key: "total_stock",
    //   render: (totalStock: number) => getStockTag(totalStock),
    // },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Product) => (
        <Space size="middle">
           <Button type="default" onClick={() => navigate(`/admin/products/detail/${record.id}`)}>
                    Xem
                </Button>
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