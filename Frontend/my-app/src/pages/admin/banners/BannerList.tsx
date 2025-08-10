import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  message,
  Typography,
  Card,
  Image,
  Switch,
  Upload,
  Modal,
  Form,
  Input,
  Popconfirm,
  Tag,
  Statistic,
  Row,
  Col,
} from "antd";
import type { TableProps, UploadFile } from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UploadOutlined,
  EyeOutlined,
  FileImageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Banner } from "../../../types/BannerType";

const { Title } = Typography;

export default function BannerList() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/banners');
      const result = await response.json();
      setBanners(result.data || []);
    } catch (error) {
      message.error("Không thể tải danh sách banner");
      console.error("Fetch banners error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingBanner(null);
    setFileList([]);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    form.setFieldsValue({
      status: banner.status,
    });
    // Set existing image in file list for preview
    setFileList([{
      uid: banner.id.toString(),
      name: `banner-${banner.id}`,
      status: 'done',
      url: banner.image_url,
    }]);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      message.success('Xóa banner thành công!');
      fetchBanners();
    } catch (error) {
      message.error('Không thể xóa banner');
      console.error('Delete banner error:', error);
    }
  };

  const handleStatusChange = async (id: number, status: boolean) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/banners/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Update failed');
      }

      message.success('Cập nhật trạng thái thành công!');
      fetchBanners();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
      console.error('Update status error:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      
      // Add form fields
      formData.append('status', values.status ? '1' : '0');
      
      // Add image file if selected
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      const url = editingBanner 
        ? `http://localhost:8000/api/admin/banners/${editingBanner.id}`
        : 'http://localhost:8000/api/admin/banners';
      
      const method = editingBanner ? 'PUT' : 'POST';
      
      // For PUT requests with FormData, use method spoofing
      if (editingBanner) {
        formData.append('_method', 'PUT');
      }

      const response = await fetch(url, {
        method: editingBanner ? 'POST' : 'POST', // Always POST for FormData with Laravel
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }

      message.success(editingBanner ? 'Cập nhật banner thành công!' : 'Thêm banner thành công!');
      setModalVisible(false);
      fetchBanners();
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra');
      console.error('Submit banner error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const columns: TableProps<Banner>['columns'] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Hình ảnh",
      dataIndex: "image_url",
      key: "image_url",
      width: 150,
      render: (imageUrl: string) => (
        <Image
          width={100}
          height={60}
          src={imageUrl}
          alt="Banner"
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN4MA"
        />
      ),
    },
    {
      title: "URL",
      dataIndex: "image_url",
      key: "url",
      ellipsis: true,
      render: (url: string) => (
        <span style={{ fontSize: 12, color: '#666' }}>
          {url}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: boolean, record: Banner) => (
        <Space direction="vertical" size="small">
          <Tag 
            color={status ? 'success' : 'error'}
            icon={status ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          >
            {status ? 'Đang hiển thị' : 'Đã ẩn'}
          </Tag>
          <Switch
            size="small"
            checked={status}
            onChange={(checked) => handleStatusChange(record.id, checked)}
            checkedChildren="ON"
            unCheckedChildren="OFF"
          />
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      render: (_, record: Banner) => (
        <Space size="small">
          <Button
            type="default"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              Modal.info({
                title: `Xem trước Banner #${record.id}`,
                content: (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Image
                      src={record.image_url}
                      alt={`Banner ${record.id}`}
                      style={{ maxWidth: '100%', maxHeight: '400px' }}
                    />
                  </div>
                ),
                width: 600,
                okText: 'Đóng',
              });
            }}
            title="Xem trước"
          />
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Chỉnh sửa"
          />
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa banner này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              title="Xóa"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Tính toán thống kê
  const totalBanners = banners.length;
  const activeBanners = banners.filter(banner => banner.status).length;
  const inactiveBanners = totalBanners - activeBanners;

  return (
    <div style={{ padding: '20px' }}>
      {/* Card thống kê */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng số Banner"
              value={totalBanners}
              prefix={<FileImageOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Banner đang hiển thị"
              value={activeBanners}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Banner đã ẩn"
              value={inactiveBanners}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            Danh sách Banner
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Thêm Banner
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={banners}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} banner`,
          }}
        />
      </Card>

      <Modal
        title={editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: true }}
        >
          <Form.Item
            label="Hình ảnh"
            required
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false} // Prevent auto upload
              maxCount={1}
            >
              {fileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>
            <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
              Chọn ảnh banner (khuyến nghị: 1200x400px)
            </div>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
