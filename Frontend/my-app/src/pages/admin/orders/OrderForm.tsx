import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createOrder, getOrder, updateOrder } from "../../../api/order";
import { Order } from "../../../types/ProductType";
import {
  Form,
  Input,
  Button,
  Typography,
  Select,
  message,
  Row,
  Col,
} from "antd";
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "../../../utils/orderStatus";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function OrderForm() {
  const [formRef] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [currentStatusIndex, setCurrentStatusIndex] = useState<number>(-1);

  useEffect(() => {
    if (isEditing) {
      const orderId = Number(id);
      if (isNaN(orderId)) {
        message.error("ID đơn hàng không hợp lệ.");
        navigate("/admin/orders");
        return;
      }

      getOrder(orderId)
        .then((res) => {
          const orderData: Order = res.data;
          formRef.setFieldsValue(orderData);
          const statusIdx = ORDER_STATUS_OPTIONS.findIndex(
            (opt) => opt.value === orderData.status
          );
          setCurrentStatusIndex(statusIdx);
        })
        .catch(() => {
          message.error("Không tìm thấy đơn hàng.");
        });
    } else {
      formRef.setFieldsValue({
        status: "pending_confirmation",
        payment_status: "unpaid",
        payment_method: "COD",
        shipping_fee: 30000,
        discount_amount: 0,
        total_amount: 0,
        final_amount: 0,
        notes: null,
      });
    }
  }, [id, isEditing, formRef, navigate]);

  const onFinish = async (values: any) => {
    const orderData: Partial<Order> = {
      user_id: Number(values.user_id),
      customer_name: values.customer_name,
      customer_email: values.customer_email,
      customer_phone: values.customer_phone,
      shipping_address: values.shipping_address,
      total_amount: Number(values.total_amount),
      shipping_fee: Number(values.shipping_fee),
      discount_amount: Number(values.discount_amount),
      final_amount: Number(values.final_amount),
      status: values.status,
      payment_method: values.payment_method,
      is_paid: values.is_paid,
      notes: values.notes || null,
    };

    try {
      if (isEditing) {
        await updateOrder(Number(id), orderData);
        message.success("Cập nhật đơn hàng thành công");
      } else {
        await createOrder(
          orderData as Omit<Order, "id" | "created_at" | "updated_at">
        );
        message.success("Tạo đơn hàng thành công");
      }
      navigate("/admin/orders");
    } catch (error) {
      message.error(`Lỗi: ${isEditing ? "Cập nhật" : "Tạo mới"} đơn hàng.`);
      console.error("Order form submission error:", error);
    }
  };

  return (
    <div>
      <Title level={3}>
        {isEditing ? "Chỉnh sửa đơn hàng" : "Tạo mới đơn hàng"}
      </Title>
      <Form form={formRef} onFinish={onFinish} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="ID Khách hàng (User ID)"
              name="user_id"
              rules={[{ required: true, message: "Vui lòng nhập User ID" }]}
            >
              <Input type="number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Tên khách hàng"
              name="customer_name"
              rules={[
                { required: true, message: "Vui lòng nhập tên khách hàng" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Email khách hàng"
              name="customer_email"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email",
                  type: "email",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Số điện thoại khách hàng"
              name="customer_phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Địa chỉ giao hàng"
          name="shipping_address"
          rules={[
            { required: true, message: "Vui lòng nhập địa chỉ giao hàng" },
          ]}
        >
          <TextArea rows={3} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Tổng tiền sản phẩm"
              name="total_amount"
              rules={[
                { required: true, message: "Vui lòng nhập tổng tiền sản phẩm" },
              ]}
            >
              <Input type="number" min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Phí vận chuyển"
              name="shipping_fee"
              rules={[
                { required: true, message: "Vui lòng nhập phí vận chuyển" },
              ]}
            >
              <Input type="number" min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Giảm giá"
              name="discount_amount"
              rules={[
                { required: true, message: "Vui lòng nhập số tiền giảm giá" },
              ]}
            >
              <Input type="number" min={0} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="Tổng tiền cuối cùng (Đã bao gồm phí ship và giảm giá)"
          name="final_amount"
          rules={[
            { required: true, message: "Vui lòng nhập tổng tiền cuối cùng" },
          ]}
        >
          <Input type="number" min={0} />
        </Form.Item>

        <Form.Item
          label="Trạng thái đơn hàng"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select placeholder="Chọn trạng thái">
            {ORDER_STATUS_OPTIONS.map((statusOption, index) => (
              <Option
                key={statusOption.value}
                value={statusOption.value}
                disabled={isEditing && index < currentStatusIndex}
              >
                {statusOption.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Phương thức thanh toán"
              name="payment_method"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn phương thức thanh toán",
                },
              ]}
            >
              <Select placeholder="Chọn phương thức">
                {PAYMENT_METHOD_OPTIONS.map((method) => (
                  <Option key={method.value} value={method.value}>
                    {method.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Trạng thái thanh toán"
              name="is_paid"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn trạng thái thanh toán",
                },
              ]}
            >
              <Select placeholder="Chọn trạng thái">
                {PAYMENT_STATUS_OPTIONS.map((status) => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Ghi chú của khách hàng" name="notes">
          <TextArea rows={2} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {isEditing ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
