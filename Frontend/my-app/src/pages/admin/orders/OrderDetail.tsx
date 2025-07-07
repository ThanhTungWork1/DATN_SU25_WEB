

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrder, getOrderItems } from "../../../api/order";
import { Order, OrderItem } from "../../../types/Order"; // Import interfaces
import { Typography, Descriptions, message, Spin, Table, Tag } from "antd";

const { Title } = Typography;

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>(); // id có thể là string
  const [order, setOrder] = useState<Order | null>(null); // Sử dụng Order interface
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]); // Sử dụng OrderItem interface
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const orderRes = await getOrder(Number(id)); // Chuyển id sang number
        setOrder(orderRes.data);

        const itemsRes = await getOrderItems(Number(id));
        setOrderItems(itemsRes.data);
      } catch (error) {
        message.error("Không tìm thấy đơn hàng hoặc chi tiết đơn hàng.");
        console.error("Fetch order detail error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [id]);

  if (loading) return <Spin tip="Đang tải chi tiết đơn hàng..." />;
  if (!order) return <Title level={4}>Không tìm thấy đơn hàng này.</Title>;

  // Hàm hiển thị trạng thái đơn hàng (tương tự OrderList)
  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case "pending_confirmation": return "Chờ xác nhận";
      case "confirmed": return "Đã xác nhận";
      case "processing": return "Đang xử lý";
      case "shipping": return "Đang giao hàng";
      case "delivered": return "Đã giao hàng";
      case "cancelled": return "Đã huỷ";
      default: return "Không rõ";
    }
  };

  const getPaymentStatusColor = (status: Order['payment_status']) => {
    switch (status) {
      case "paid": return "green";
      case "unpaid": return "red";
      case "part_paid": return "gold";
      case "refunded": return "default";
      default: return "default";
    }
  };

  const getPaymentStatusText = (status: Order['payment_status']) => {
    switch (status) {
      case "paid": return "Đã thanh toán";
      case "unpaid": return "Chưa thanh toán";
      case "part_paid": return "Thanh toán một phần";
      case "refunded": return "Đã hoàn tiền";
      default: return "Không rõ";
    }
  };

  const orderItemsColumns = [
    { title: "Tên sản phẩm", dataIndex: "product_name", key: "product_name" },
    { title: "Màu", dataIndex: "color_name", key: "color_name" },
    { title: "Kích thước", dataIndex: "size_name", key: "size_name" },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    { title: "Giá/SP", dataIndex: "price_at_order", key: "price_at_order", render: (text: number) => `${text.toLocaleString()} VND` },
    { title: "Thành tiền", key: "subtotal", render: (record: OrderItem) => `${(record.quantity * record.price_at_order).toLocaleString()} VND` },
  ];

  return (
    <div>
      <Title level={3}>Chi tiết đơn hàng #{order.id}</Title>
      <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Mã đơn hàng">{order.id}</Descriptions.Item>
        <Descriptions.Item label="Ngày đặt">
          {new Date(order.created_at).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Tên khách hàng">{order.customer_name}</Descriptions.Item>
        <Descriptions.Item label="Email khách hàng">{order.customer_email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{order.customer_phone}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ giao hàng">{order.shipping_address}</Descriptions.Item>
        <Descriptions.Item label="Tổng tiền sản phẩm">
          {order.total_amount.toLocaleString()} VND
        </Descriptions.Item>
        <Descriptions.Item label="Phí vận chuyển">
          {order.shipping_fee.toLocaleString()} VND
        </Descriptions.Item>
        <Descriptions.Item label="Giảm giá">
          {order.discount_amount.toLocaleString()} VND
        </Descriptions.Item>
        <Descriptions.Item label="Tổng cộng cuối cùng">
          <Tag color="blue" style={{ fontSize: 16, padding: '4px 8px' }}>
            {order.final_amount.toLocaleString()} VND
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái đơn hàng">
          <Tag color={getStatusColor(order.status)}>{getStatusText(order.status)}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">{order.payment_method}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái thanh toán">
           <Tag color={getPaymentStatusColor(order.payment_status)}>{getPaymentStatusText(order.payment_status)}</Tag>
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
              totalQuantity += quantity;
              totalPrice += quantity * price_at_order;
            });

            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>Tổng số lượng</Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text type="secondary">{totalQuantity}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} colSpan={1}>Tổng thành tiền</Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <Text type="secondary">{totalPrice.toLocaleString()} VND</Text>
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