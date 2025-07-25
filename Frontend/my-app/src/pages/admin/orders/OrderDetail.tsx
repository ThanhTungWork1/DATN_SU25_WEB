import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder } from "../../../api/order";
import { Order, OrderItem } from "../../../types/ProductType";
import {
  Typography,
  Descriptions,
  message,
  Spin,
  Table,
  Tag,
  Button,
  Image,
  Space
} from "antd";
import type { TableProps } from 'antd';
import { getOrderStatusColor, getOrderStatusText, getPaymentStatusColor, getPaymentStatusText } from "../../../utils/orderStatus";

const { Title, Text } = Typography;

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getOrder(Number(id));
        // API đã trả về cả order và items lồng nhau
        const orderData: Order = res.data.data ? res.data.data : res.data;
        setOrder(orderData);
        // Lấy danh sách items từ trong đơn hàng
        setOrderItems(orderData.items || []);
      } catch (error) {
        message.error("Không tìm thấy đơn hàng hoặc chi tiết đơn hàng.");
        console.error("Fetch order detail error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [id]);

  if (loading) {
    return <Spin tip="Đang tải chi tiết đơn hàng..." style={{ display: 'block', marginTop: '50px' }} />;
  }

  if (!order) {
    return <Title level={4} style={{ marginTop: '50px', textAlign: 'center' }}>Không tìm thấy đơn hàng này.</Title>;
  }

  // Cấu hình các cột cho bảng sản phẩm trong đơn hàng
  const orderItemsColumns: TableProps<OrderItem>['columns'] = [
    { 
      title: "Sản phẩm", 
      dataIndex: "product_name", 
      key: "product_name",
      render: (text, record) => (
        <Space>
            <Image 
                width={50} 
                src={record.variant_image_url || "https://placehold.co/50x50/cccccc/333333?text=N/A"} 
                alt={text} 
            />
            <Text>{text}</Text>
        </Space>
      )
    },
    { title: "Màu sắc", dataIndex: "variant_color_name", key: "variant_color_name" },
    { title: "Kích thước", dataIndex: "variant_size_name", key: "variant_size_name" },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    { 
      title: "Giá tại thời điểm mua", 
      dataIndex: "price", 
      key: "price", 
      render: (text) => `${Number(text).toLocaleString()} VND`
    },
    { 
      title: "Thành tiền", 
      key: "subtotal", 
      render: (record: OrderItem) => {
        const subtotal = (record.quantity || 0) * (record.price || 0);
        return <Text strong>{subtotal.toLocaleString()} VND</Text>;
      }
    },
  ];

  return (
    <div>
      <Title level={3}>Chi tiết đơn hàng #{order.id}</Title>
      <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
        {/* ... các Descriptions.Item cho thông tin chung của đơn hàng giữ nguyên ... */}
        <Descriptions.Item label="Mã đơn hàng">{order.id}</Descriptions.Item>
        <Descriptions.Item label="Ngày đặt">{new Date(order.created_at).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Tên khách hàng">{order.customer_name}</Descriptions.Item>
        <Descriptions.Item label="Email khách hàng">{order.customer_email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{order.customer_phone}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ giao hàng">{order.shipping_address}</Descriptions.Item>
        <Descriptions.Item label="Tổng tiền sản phẩm">{(order.total_amount || 0).toLocaleString()} VND</Descriptions.Item>
        <Descriptions.Item label="Phí vận chuyển">{(order.shipping_fee || 0).toLocaleString()} VND</Descriptions.Item>
        <Descriptions.Item label="Giảm giá">{(order.discount_amount || 0).toLocaleString()} VND</Descriptions.Item>
        <Descriptions.Item label="Tổng cộng cuối cùng">
            <Tag color="blue" style={{ fontSize: 16, padding: '4px 8px' }}>
                {(order.final_amount || 0).toLocaleString()} VND
            </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái đơn hàng"><Tag color={getOrderStatusColor(order.status)}>{getOrderStatusText(order.status)}</Tag></Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">{order.payment_method}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái thanh toán"><Tag color={getPaymentStatusColor(order.is_paid)}>{getPaymentStatusText(order.is_paid)}</Tag></Descriptions.Item>
        <Descriptions.Item label="Ghi chú của khách">{order.notes || "Không có"}</Descriptions.Item>
      </Descriptions>

      <Title level={4}>Sản phẩm trong đơn hàng</Title>
      {orderItems.length > 0 ? (
        <Table
          columns={orderItemsColumns}
          dataSource={orderItems}
          rowKey="id"
          pagination={false}
          bordered
        />
      ) : (
        <p>Đơn hàng này không có sản phẩm nào.</p>
      )}
    </div>
  );
}
