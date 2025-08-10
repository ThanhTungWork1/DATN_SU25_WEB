import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Image, 
  Descriptions, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Spin, 
  message,
  Modal,
  Typography
} from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

const { Title } = Typography;

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  status: boolean;
  material?: string;
  description?: string;
  image_url?: string;
  variants?: VariantWithDetails[];
}

interface VariantWithDetails {
  id: number;
  color: { name: string };
  size: { name: string };
  stock: number;
  price: number;
  sku?: string;
  image_url?: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/admin/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.data || data);
      } else {
        message.error('Không thể tải thông tin sản phẩm');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      message.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Cấu hình các cột cho bảng biến thể
  const variantColumns: TableProps<VariantWithDetails>["columns"] = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Màu sắc", dataIndex: ['color', 'name'], key: "color" },
    { title: "Kích thước", dataIndex: ['size', 'name'], key: "size" },
    { title: "Tồn kho", dataIndex: "stock", key: "stock", render: (stock: number) => <Tag color={stock > 0 ? 'blue' : 'red'}>{stock}</Tag> },
    { title: "Giá", dataIndex: "price", key: "price", render: (price: number) => `${(Number(price) * 1000).toLocaleString()} VND` },
    { title: "SKU", dataIndex: "sku", key: "sku", render: (sku: string) => sku || 'N/A' },
    { 
      title: "Ảnh riêng", 
      dataIndex: "image_url", 
      key: "image", 
      render: (imageUrl: string) => imageUrl ? (
        <Image src={imageUrl} width={50} height={50} style={{ objectFit: 'cover' }} />
      ) : (
        <span>Không có</span>
      )
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />}>
            Sửa
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Không tìm thấy sản phẩm</Title>
        <Button type="primary" onClick={() => navigate('/admin/products')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space style={{ marginBottom: '24px' }}>
        <Button 
          type="default" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/admin/products')}
        >
          Quay lại
        </Button>
        <Title level={2} style={{ margin: 0 }}>Chi tiết sản phẩm: {product.name}</Title>
      </Space>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card title="Hình ảnh sản phẩm">
            <Image.PreviewGroup>
              <Image
                src={product.image_url || '/placeholder-image.jpg'}
                alt={product.name}
                style={{ width: '100%', height: '300px', objectFit: 'cover' }}
              />
            </Image.PreviewGroup>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card>
            <Descriptions title="Thông tin chung" bordered column={1}>
              <Descriptions.Item label="Tên sản phẩm">{product.name}</Descriptions.Item>
              <Descriptions.Item label="Slug">{product.slug}</Descriptions.Item>
              <Descriptions.Item label="Giá bán">{(Number(product.price) * 1000).toLocaleString()} VND</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={product.status ? 'green' : 'red'}>
                  {product.status ? 'Đang bán' : 'Ngừng bán'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Chất liệu">{product.material || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Mô tả">{product.description || 'Chưa có mô tả'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {product.variants && product.variants.length > 0 && (
        <Card title="Danh sách biến thể" style={{ marginTop: '24px' }}>
          <Table
            columns={variantColumns}
            dataSource={product.variants}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        </Card>
      )}

      <Space style={{ marginTop: '24px' }}>
        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/admin/products/edit/${product.id}`)}>
          Chỉnh sửa sản phẩm
        </Button>
        <Button danger icon={<DeleteOutlined />}>
          Xóa sản phẩm
        </Button>
      </Space>
    </div>
  );
};

export default ProductDetail;
