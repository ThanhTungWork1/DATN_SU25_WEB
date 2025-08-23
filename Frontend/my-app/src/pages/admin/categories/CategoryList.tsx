// src/pages/admin/categories/CategoryList.tsx
import React, { useState, useEffect } from 'react';
import "../../../assets/styles/admin-responsive.css";
import {
  Table,
  Button,
  Space,
  message,
  Typography,
  Popconfirm,
  Tag,
  Modal,
  Form,
  Input,
  Switch,
} from "antd";
import type { TableProps } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Category } from "../../../types/ProductType";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../api/category";

const { Title } = Typography;

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // SỬA LẠI: Dùng isModalOpen
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      // SỬA LỖI: Xử lý dữ liệu trả về một cách an toàn
      // Kiểm tra xem res.data.data có phải là mảng không, nếu không thì kiểm tra res.data
      const categoriesData = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];
      setCategories(categoriesData);
    } catch (error) {
      message.error("Không thể tải danh sách danh mục.");
      console.error("Fetch categories error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showModal = (category: Category | null = null) => {
    setEditingCategory(category);
    if (category) {
      form.setFieldsValue({ name: category.name, status: category.status });
    } else {
      form.resetFields();
      form.setFieldsValue({ status: true });
    }
    setIsModalOpen(true); // SỬA LẠI: Dùng setIsModalOpen
  };

  const handleCancel = () => {
    setIsModalOpen(false); // SỬA LẠI: Dùng setIsModalOpen
    setEditingCategory(null);
  };

  const handleFinish = async (values: { name: string; status: boolean }) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, values);
        message.success("Cập nhật danh mục thành công!");
      } else {
        await createCategory(values);
        message.success("Tạo mới danh mục thành công!");
      }
      fetchData();
      handleCancel();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Đã có lỗi xảy ra.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      message.success("Xóa danh mục thành công!");
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể xóa danh mục.");
    }
  };

  const columns: TableProps<Category>["columns"] = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Tên danh mục", dataIndex: "name", key: "name" },
    // THÊM MỚI: Cột hiển thị số lượng sản phẩm
    {
      title: "Số lượng sản phẩm",
      dataIndex: "products_count",
      key: "products_count",
      align: "center",
      render: (count: number) => `${count} sản phẩm`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Hoạt động" : "Tạm ẩn"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            disabled={
              record.products_count !== undefined && record.products_count > 0
            } // Vô hiệu hóa nút xóa nếu có sản phẩm
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              disabled={
                record.products_count !== undefined && record.products_count > 0
              }
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space
        style={{
          marginBottom: 16,
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Title level={3}>Quản lý Danh mục</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Thêm mới
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingCategory ? "Chỉnh sửa Danh mục" : "Tạo mới Danh mục"}
        // SỬA LẠI: Dùng 'open' thay vì 'visible'
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" valuePropName="checked">
            <Switch
              checkedChildren="Hoạt động"
              unCheckedChildren="Tạm ẩn"
              defaultChecked
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingCategory ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
