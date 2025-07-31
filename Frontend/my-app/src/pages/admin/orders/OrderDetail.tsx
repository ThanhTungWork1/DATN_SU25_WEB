import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrder, updateOrder } from "../../../api/order";
import { Order } from "../../../types/ProductType";
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
  Input
} from "antd";
import { ArrowLeftOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from "../../../utils/orderStatus";

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
      setOrder(response.data);
      form.setFieldsValue({
        status: response.data.status,
        is_paid: response.data.is_paid,
        notes: response.data.notes
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
      cancelled: "red"
    };
    return statusMap[status] || "default";
  };

  const getStatusLabel = (status: string) => {
    const statusOption = ORDER_STATUS_OPTIONS.find(opt => opt.value === status);
    return statusOption?.label || status;
  };

  const orderItemsColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "product_name",
      key: "product_name",
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.variant_color_name} - {record.variant_size_name}
          </div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            SKU: {record.variant_sku}
          </div>
        </div>
      )
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `${price.toLocaleString()} VND`
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity"
    },
    {
      title: "Thành tiền",
      key: "subtotal",
      render: (record: any) => `${(record.price * record.quantity).toLocaleString()} VND`
    }
  ];

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!order) {
    return <div>Không tìm thấy đơn hàng</div>;
  }

  return (
    <div>
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
              <Descriptions.Item label="Ngày đặt">
                {new Date(order.created_at).toLocaleString()}
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
                {order.payment_method}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {order.notes || "Không có"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Thông tin khách hàng */}
          <Card title="Thông tin khách hàng" style={{ marginBottom: 16 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Tên khách hàng">
                {order.customer_name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {order.customer_email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {order.customer_phone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng">
                {order.shipping_address}
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
                    <Text strong>{order.final_amount.toLocaleString()} VND</Text>
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
              <Descriptions.Item label="Tổng tiền hàng">
                <Text>{order.total_amount.toLocaleString()} VND</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">
                <Text>{order.shipping_fee.toLocaleString()} VND</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Giảm giá">
                <Text type="danger">-{order.discount_amount.toLocaleString()} VND</Text>
              </Descriptions.Item>
              <Divider />
              <Descriptions.Item label="Thành tiền">
                <Text strong style={{ fontSize: "18px" }}>
                  {order.final_amount.toLocaleString()} VND
                </Text>
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
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateOrder}
        >
          <Form.Item
            name="status"
            label="Trạng thái đơn hàng"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái">
              {ORDER_STATUS_OPTIONS.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="is_paid"
            label="Trạng thái thanh toán"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái thanh toán" }]}
          >
            <Select placeholder="Chọn trạng thái thanh toán">
              {PAYMENT_STATUS_OPTIONS.map(option => (
                <Option key={String(option.value)} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea rows={4} placeholder="Nhập ghi chú (tùy chọn)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={updating} icon={<SaveOutlined />}>
                Lưu thay đổi
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
