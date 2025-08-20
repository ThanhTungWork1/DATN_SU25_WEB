import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder, updateOrder } from "../../../api/order";
import { Order } from "../../../types/Order";
import {
  Card,
  Descriptions,
  Table,
  Button,
  message,
  Typography,
  Tag,
  Space,
  Divider,
  Row,
  Col,
  Select,
  Modal,
  Form,
  Input,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "../../../utils/orderStatus";
import { formatCurrency } from "../../../utils/currencyFormatter";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await getOrder(id!);
      const orderData = response.data.data || response.data;
      setOrder(orderData);
      form.setFieldsValue({
        status: orderData.status,
        is_paid: orderData.is_paid,
        notes: orderData.notes,
        shipping_company: orderData.shipping_company || "",
        tracking_number: orderData.tracking_number || "",
        estimated_delivery_date: orderData.estimated_delivery_date
          ? new Date(orderData.estimated_delivery_date)
              .toISOString()
              .slice(0, 16)
          : "",
      });
    } catch (error) {
      message.error("Không thể tải thông tin đơn hàng");
      console.error("Fetch order detail error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async (values: any) => {
    setUpdating(true);
    try {
      await updateOrder(parseInt(id!), values);
      message.success("Cập nhật đơn hàng thành công!");
      setEditModalVisible(false);
      fetchOrderDetail(); // Refresh data
    } catch (error) {
      message.error("Không thể cập nhật đơn hàng");
      console.error("Update order error:", error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending_confirmation: "orange",
      confirmed: "blue",
      processing: "cyan",
      shipping: "purple",
      delivered: "green",
      completed: "green",
      cancelled: "red",
    };
    return statusMap[status] || "default";
  };

  const getStatusLabel = (status: string) => {
    const statusOption = ORDER_STATUS_OPTIONS.find(
      (opt) => opt.value === status
    );
    return statusOption?.label || status;
  };

  const orderItemsColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "product_name",
      key: "product_name",
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: "bold", fontSize: "14px" }}>
            {record.variant?.product?.name ||
              record.product_name ||
              "Không có tên"}
          </div>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
            <strong>Màu:</strong>{" "}
            {record.variant?.color?.name ||
              record.variant_color_name ||
              "Không có"}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            <strong>Size:</strong>{" "}
            {record.variant?.size?.name ||
              record.variant_size_name ||
              "Không có"}
          </div>
          <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
            <strong>SKU:</strong>{" "}
            {record.variant?.sku || record.variant_sku || "Không có"}
          </div>
          {(record.variant?.image || record.variant_image) && (
            <div style={{ marginTop: "8px" }}>
              <img
                src={
                  record.variant?.image_url ||
                  record.variant_image_url ||
                  record.variant_image
                }
                alt={record.variant?.product?.name || record.product_name}
                style={{
                  width: "50px",
                  height: "50px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => (
        <div style={{ fontWeight: "bold", color: "#1890ff" }}>
          {formatCurrency(price || 0)}
        </div>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number) => (
        <div style={{ fontWeight: "bold", textAlign: "center" }}>
          {quantity}
        </div>
      ),
    },
    {
      title: "Thành tiền",
      key: "subtotal",
      render: (record: any) => (
        <div style={{ fontWeight: "bold", color: "#52c41a" }}>
          {formatCurrency((record.price || 0) * (record.quantity || 0))}
        </div>
      ),
    },
  ];

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!order) {
    return <div>Không tìm thấy đơn hàng</div>;
  }

  // Đảm bảo các giá trị số không undefined (đã là VND trong DB)
  const totalAmount = order.total_amount || 0;
  const shippingFee = order.shipping_fee || 0;
  const discountAmount = order.discount_amount || 0;
  const finalAmount = order.final_amount || 0;

  return (
    <div>
      <Title level={3}>Chi tiết đơn hàng #{order.id}</Title>
      <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Mã đơn hàng">{order.id}</Descriptions.Item>
        <Descriptions.Item label="Ngày đặt">
          {new Date(order.created_at).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Tên khách hàng">
          {order.customer_name}
        </Descriptions.Item>
        <Descriptions.Item label="Email khách hàng">
          {order.customer_email}
        </Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {order.customer_phone}
        </Descriptions.Item>
        <Descriptions.Item label="Địa chỉ giao hàng">
          {order.shipping_address}
        </Descriptions.Item>
        <Descriptions.Item label="Tổng tiền sản phẩm">
          {formatCurrency(order.total_amount || 0)}
        </Descriptions.Item>
        <Descriptions.Item label="Phí vận chuyển">
          {formatCurrency(order.shipping_fee || 0)}
        </Descriptions.Item>
        <Descriptions.Item label="Giảm giá">
          {formatCurrency(order.discount_amount || 0)}
        </Descriptions.Item>
        <Descriptions.Item label="Tổng cộng">
          <Tag color="blue" style={{ fontSize: 16, padding: "4px 8px" }}>
            {formatCurrency(
              order.final_amount ||
                order.total_amount +
                  order.shipping_fee -
                  (order.discount_amount || 0) ||
                0
            )}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái đơn hàng">
          <Tag color={getStatusColor(order.status)}>
            {getStatusLabel(order.status)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">
          {order.payment_method}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái thanh toán">
          <Tag color={order.is_paid ? "green" : "red"}>
            {order.is_paid ? "Đã thanh toán" : "Chưa thanh toán"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ghi chú của khách">
          {order.notes || "Không có"}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/orders")}
          style={{ marginRight: 8 }}
        >
          Quay lại
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => setEditModalVisible(true)}
        >
          Chỉnh sửa
        </Button>
      </div>

      <Title level={2}>Chi tiết đơn hàng #{order.id}</Title>

      <Row gutter={16}>
        <Col span={16}>
          {/* Thông tin đơn hàng */}
          <Card title="Thông tin đơn hàng" style={{ marginBottom: 16 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Mã đơn hàng">
                <Text strong>#{order.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Order Code">
                <Text strong>{order.order_code || "Không có"}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {new Date(order.created_at).toLocaleString("vi-VN")}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {new Date(order.updated_at).toLocaleString("vi-VN")}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(order.status)}>
                  {getStatusLabel(order.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                <Tag color={order.is_paid ? "green" : "red"}>
                  {order.is_paid ? "Đã thanh toán" : "Chưa thanh toán"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {order.payment_method || "COD"}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                {order.notes || "Không có"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Thông tin khách hàng */}
          <Card title="Thông tin khách hàng" style={{ marginBottom: 16 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Tên khách hàng">
                <Text strong>{order.customer_name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Text copyable>{order.customer_email}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <Text copyable>{order.customer_phone}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
                <Text>{order.shipping_address}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Thông tin giao hàng */}
          <Card title="Thông tin giao hàng" style={{ marginBottom: 16 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Ngày giao hàng">
                {order.delivered_at
                  ? new Date(order.delivered_at).toLocaleString("vi-VN")
                  : "Chưa giao"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày vận chuyển">
                {order.shipping_date
                  ? new Date(order.shipping_date).toLocaleString("vi-VN")
                  : "Chưa vận chuyển"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày dự kiến giao">
                {order.estimated_delivery_date
                  ? new Date(order.estimated_delivery_date).toLocaleString(
                      "vi-VN"
                    )
                  : "Chưa có"}
              </Descriptions.Item>
              <Descriptions.Item label="Mã vận đơn">
                {order.tracking_number ? (
                  <Text copyable style={{ color: "#1890ff" }}>
                    {order.tracking_number}
                  </Text>
                ) : (
                  "Chưa có"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Đơn vị vận chuyển">
                {order.shipping_company || "Chưa có"}
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">
                <Text strong style={{ color: "#52c41a" }}>
                  {formatCurrency(order.shipping_fee || 0)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Danh sách sản phẩm */}
          <Card title="Danh sách sản phẩm">
            <Table
              columns={orderItemsColumns}
              dataSource={order.items}
              rowKey="id"
              pagination={false}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text strong>Tổng cộng</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <Text strong>{formatCurrency(finalAmount)}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </Card>
        </Col>

        <Col span={8}>
          {/* Tổng quan đơn hàng */}
          <Card title="Tổng quan đơn hàng">
            <Descriptions column={1}>
              <Descriptions.Item label="Tổng số sản phẩm">
                <Text strong>
                  {order.total_items || order.items?.length || 0} sản phẩm
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng số lượng">
                <Text strong>
                  {order.total_quantity ||
                    order.items?.reduce(
                      (sum, item) => sum + (item.quantity || 0),
                      0
                    ) ||
                    0}{" "}
                  cái
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền hàng">
                <Text strong style={{ fontSize: "16px", color: "#1890ff" }}>
                  {formatCurrency(totalAmount)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">
                <Text style={{ color: "#52c41a" }}>
                  {formatCurrency(shippingFee)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Giảm giá">
                <Text type="danger" style={{ fontSize: "14px" }}>
                  -{formatCurrency(discountAmount)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thành tiền">
                <Text strong style={{ fontSize: "18px", color: "#f5222d" }}>
                  {formatCurrency(finalAmount)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Thống kê nhanh */}
          <Card title="Thống kê nhanh" style={{ marginTop: 16 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="Thời gian xử lý">
                <Text>
                  {order.status === "delivered" &&
                  order.delivered_at &&
                  order.created_at
                    ? `${Math.ceil((new Date(order.delivered_at).getTime() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24))} ngày`
                    : "Đang xử lý"}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái hiện tại">
                <Tag color={getStatusColor(order.status)}>
                  {getStatusLabel(order.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                <Tag color={order.is_paid ? "green" : "red"}>
                  {order.is_paid ? "Đã thanh toán" : "Chưa thanh toán"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Modal chỉnh sửa */}
      <Modal
        title="Chỉnh sửa đơn hàng"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateOrder}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái đơn hàng"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  {ORDER_STATUS_OPTIONS.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="is_paid"
                label="Trạng thái thanh toán"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn trạng thái thanh toán",
                  },
                ]}
              >
                <Select placeholder="Chọn trạng thái thanh toán">
                  {PAYMENT_STATUS_OPTIONS.map((option) => (
                    <Option key={String(option.value)} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="shipping_company" label="Đơn vị vận chuyển">
                <Input placeholder="Nhập đơn vị vận chuyển" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tracking_number" label="Mã vận đơn">
                <Input placeholder="Nhập mã vận đơn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="estimated_delivery_date"
                label="Ngày dự kiến giao"
              >
                <Input type="datetime-local" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={4} placeholder="Nhập ghi chú (tùy chọn)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={updating}
                icon={<SaveOutlined />}
              >
                Lưu thay đổi
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
