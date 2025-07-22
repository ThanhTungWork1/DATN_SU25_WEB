// src/pages/admin/orders/OrderDetail.tsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrder, getOrderItems } from "../../../api/order";
import { Order, OrderItem } from "../../../types/ProductType";
import { Typography, Descriptions, message, Spin, Table, Tag } from "antd";
import { getOrderStatusColor, getOrderStatusText, getPaymentStatusColor, getPaymentStatusText } from "../../../utils/orderStatus";

const { Title, Text } = Typography;

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!id) return;
      setLoading(true);
      
      try {
        // Sử dụng Promise.allSettled để gọi cả hai API mà không bị dừng lại nếu một trong hai lỗi
        const results = await Promise.allSettled([
          getOrder(Number(id)),
          getOrderItems(Number(id)),
        ]);

        // Xử lý kết quả của getOrder
        const orderResult = results[0];
        if (orderResult.status === 'fulfilled') {
          const orderData: Order = orderResult.value.data.data ? orderResult.value.data.data : orderResult.value.data;
          setOrder(orderData);
        } else {
          message.error("Lỗi: Không tìm thấy đơn hàng.");
          console.error("Fetch order error:", orderResult.reason);
          setOrder(null);
        }

        // Xử lý kết quả của getOrderItems
        const itemsResult = results[1];
        if (itemsResult.status === 'fulfilled') {
          const orderItemsData: OrderItem[] = Array.isArray(itemsResult.value.data.data) ? itemsResult.value.data.data : itemsResult.value.data;
          setOrderItems(orderItemsData);
        } else {
          console.warn("Could not fetch order items:", itemsResult.reason);
          setOrderItems([]);
        }

      } catch (err) {
        message.error("Đã có lỗi không xác định xảy ra.");
        console.error("An unexpected error occurred:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [id]);

  if (loading) return <Spin tip="Đang tải chi tiết đơn hàng..." style={{marginTop: '50px', textAlign: 'center', width: '100%'}} />;
  if (!order) return <Title level={4} style={{marginTop: '50px', textAlign: 'center'}}>Không tìm thấy đơn hàng này.</Title>;

  const orderItemsColumns = [
    { title: "Tên sản phẩm", dataIndex: "product_name", key: "product_name" },
    { title: "Màu", dataIndex: "color_name", key: "color_name" },
    { title: "Kích thước", dataIndex: "size_name", key: "size_name" },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    { 
      title: "Giá/SP", 
      dataIndex: "price_at_order", 
      key: "price_at_order", 
      render: (text: number | undefined | null) => {
        if (text === undefined || text === null) return '-';
        return `${text.toLocaleString()} VND`;
      }
    },
    { 
      title: "Thành tiền", 
      key: "subtotal", 
      render: (record: OrderItem) => {
        const quantity = record.quantity || 0;
        const price = record.price_at_order || 0;
        return `${(quantity * price).toLocaleString()} VND`;
      }
    },
  ];

  return (
    <div>
      <Title level={3}>Chi tiết đơn hàng #{order.id}</Title>
      <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Mã đơn hàng">{order.id}</Descriptions.Item>
        <Descriptions.Item label="Ngày đặt">
          {order.created_at ? new Date(order.created_at).toLocaleString() : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Tên khách hàng">{order.customer_name || '-'}</Descriptions.Item>
        <Descriptions.Item label="Email khách hàng">{order.customer_email || '-'}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{order.customer_phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ giao hàng">{order.shipping_address || '-'}</Descriptions.Item>
        <Descriptions.Item label="Tổng tiền sản phẩm">
          {(order.total_amount || 0).toLocaleString()} VND
        </Descriptions.Item>
        <Descriptions.Item label="Phí vận chuyển">
          {(order.shipping_fee || 0).toLocaleString()} VND
        </Descriptions.Item>
        <Descriptions.Item label="Giảm giá">
          {(order.discount_amount || 0).toLocaleString()} VND
        </Descriptions.Item>
        <Descriptions.Item label="Tổng cộng">
          <Tag color="blue" style={{ fontSize: 16, padding: '4px 8px' }}>
            {(order.final_amount || 0).toLocaleString()} VND
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái đơn hàng">
          <Tag color={getOrderStatusColor(order.status)}>{getOrderStatusText(order.status)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">{order.payment_method || '-'}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái thanh toán">
           <Tag color={getPaymentStatusColor(order.is_paid)}>{getPaymentStatusText(order.is_paid)}</Tag>
        </Descriptions.Item>
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
          summary={pageData => {
            let totalQuantity = 0;
            let totalPrice = 0;
            pageData.forEach(({ quantity, price_at_order }) => {
              totalQuantity += quantity || 0;
              totalPrice += (quantity || 0) * (price_at_order || 0);
            });

            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <Text strong>Tổng cộng</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong>{totalQuantity}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                    {/* Placeholder cell */}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <Text strong>{totalPrice.toLocaleString()} VND</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      ) : (
        <p>Đơn hàng này không có sản phẩm nào.</p>
      )}
    </div>
  );
}