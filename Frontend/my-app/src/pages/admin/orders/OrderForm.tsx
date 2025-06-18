import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createOrder, getOrder, updateOrder } from "../../../api/order";
import { Form, Input, Button, Typography, Select, message } from "antd";

const { Title } = Typography;
const { Option } = Select;

export default function OrderForm() {
  const [formRef] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getOrder(id)
        .then((res) => {
          console.log("📦 Dữ liệu đơn hàng:", res.data); // ✅ Log kiểm tra
          const data = res.data;
          if (data && data.customer_name && data.total && data.status) {
            formRef.setFieldsValue(data);
          } else {
            message.warning("Thiếu dữ liệu đơn hàng!");
          }
        })
        .catch(() => {
          message.error("Không tìm thấy đơn hàng");
        });
    }
  }, [id]);

  const onFinish = async (values: any) => {
    if (id) {
      await updateOrder(id, values);
      message.success("Cập nhật đơn hàng thành công");
    } else {
      await createOrder(values);
      message.success("Tạo đơn hàng thành công");
    }
    navigate("/admin/orders");
  };

  return (
    <div>
      <Title level={3}>{id ? "Chỉnh sửa đơn hàng" : "Tạo mới đơn hàng"}</Title>
      <Form form={formRef} onFinish={onFinish} layout="vertical">
        <Form.Item
          label="Tên khách hàng"
          name="customer_name"
          rules={[{ required: true, message: "Vui lòng nhập tên" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Tổng tiền"
          name="total"
          rules={[{ required: true, message: "Vui lòng nhập tổng tiền" }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select>
            <Option value="Chờ xác nhận">Chờ xác nhận</Option>
            <Option value="Đã xác nhận">Đã xác nhận</Option>
            <Option value="Đang giao">Đang giao</Option>
            <Option value="Đã giao">Đã giao</Option>
            <Option value="Đã huỷ">Đã huỷ</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {id ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
