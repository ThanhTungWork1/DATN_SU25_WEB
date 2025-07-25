// src/pages/admin/products/ProductDetail.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct } from "../../../api/product";
import { Product, ProductVariant } from "../../../types/ProductType";
import {
  Typography,
  Descriptions,
  message,
  Spin,
  Table,
  Tag,
  Image,
  Row,
  Col,
  Button,
  Divider,
  Space
} from "antd";
import type { TableProps } from 'antd';

const { Title } = Typography;

// Mở rộng interface ProductVariant để bao gồm cả đối tượng color và size từ API
interface VariantWithDetails extends ProductVariant {
    color: { name: string };
    size: { name: string };
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<VariantWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getProduct(Number(id));
        // API đã trả về cả product và variants lồng nhau
        setProduct(res.data);
        setVariants(res.data.variants || []);
      } catch (error) {
        message.error("Không tìm thấy sản phẩm này.");
        console.error("Fetch product detail error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (loading) {
    return <Spin tip="Đang tải chi tiết sản phẩm..." style={{ display: 'block', marginTop: '50px' }} />;
  }

  if (!product) {
    return <Title level={4} style={{ marginTop: '50px', textAlign: 'center' }}>Không tìm thấy sản phẩm.</Title>;
  }

  // Cấu hình các cột cho bảng biến thể
  const variantColumns: TableProps<VariantWithDetails>['columns'] = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Màu sắc", dataIndex: ['color', 'name'], key: "color" },
    { title: "Kích thước", dataIndex: ['size', 'name'], key: "size" },
    { title: "Tồn kho", dataIndex: "stock", key: "stock", render: (stock) => <Tag color={stock > 0 ? 'blue' : 'red'}>{stock}</Tag> },
    { title: "Giá", dataIndex: "price", key: "price", render: (price) => `${Number(price).toLocaleString()} VND` },
    { title: "SKU", dataIndex: "sku", key: "sku", render: (sku) => sku || 'N/A' },
    { title: "Ảnh riêng", dataIndex: "image", key: "image", render: (url) => url ? <Image src={url} width={40} /> : 'N/A' },
  ];

  return (
    <div>
      <Title level={3}>Chi tiết sản phẩm: {product.name}</Title>
      
      <Row gutter={[32, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
            <Title level={5}>Ảnh sản phẩm</Title>
            <Image.PreviewGroup>
                <Space direction="vertical" align="center" style={{width: '100%'}}>
                    {product.image_url && <Image width={200} src={product.image_url} alt="Ảnh chính" />}
                    {product.hover_image_url && <Image width={200} src={product.hover_image_url} alt="Ảnh hover" />}
                </Space>
            </Image.PreviewGroup>
        </Col>
        <Col xs={24} md={16}>
            <Descriptions title="Thông tin chung" bordered column={1}>
                <Descriptions.Item label="Tên sản phẩm">{product.name}</Descriptions.Item>
                <Descriptions.Item label="Slug">{product.slug}</Descriptions.Item>
                <Descriptions.Item label="Giá bán">{Number(product.price).toLocaleString()} VND</Descriptions.Item>
                <Descriptions.Item label="Trạng thái"><Tag color={product.status ? 'green' : 'red'}>{product.status ? 'Đang bán' : 'Ngừng bán'}</Tag></Descriptions.Item>
                <Descriptions.Item label="Chất liệu">{product.material || 'Chưa cập nhật'}</Descriptions.Item>
                <Descriptions.Item label="Mô tả">{product.description || 'Chưa có mô tả'}</Descriptions.Item>
            </Descriptions>
        </Col>
      </Row>

      <Divider />

      <Title level={4}>Các biến thể của sản phẩm</Title>
      <Table
        columns={variantColumns}
        dataSource={variants}
        rowKey="id"
        pagination={false}
        bordered
      />

      <Button type="primary" onClick={() => navigate(`/admin/products/edit/${id}`)} style={{marginTop: '24px'}}>
        Chỉnh sửa sản phẩm này
      </Button>
    </div>
  );
}
