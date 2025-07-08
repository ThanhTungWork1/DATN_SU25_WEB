import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createOrder, getOrder, updateOrder } from "../../../api/order";
import { Form, Input, Button, Typography, Select, message } from "antd";

const { Title } = Typography;
const { Option } = Select;

// Danh sách trạng thái theo thứ tự luồng xử lý đơn hàng
const STATUS_LIST = [
  "Chờ xác nhận",
  "Đã xác nhận",
  "Đang giao",
  "Đã giao",
  "Đã huỷ"
];

export default function OrderForm() {
  const [formRef] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const [currentStatus, setCurrentStatus] = useState<string>("");

  useEffect(() => {
    if (id) {
      getOrder(id)
        .then((res) => {
          console.log("Dữ liệu đơn hàng:", res.data);
          formRef.setFieldsValue(res.data);
          setCurrentStatus(res.data.status); // lưu trạng thái hiện tại
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

  // Xác định trạng thái nào cần disable
  const statusIndex = STATUS_LIST.indexOf(currentStatus);

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
            {STATUS_LIST.map((status, index) => (
              <Option
                key={status}
                value={status}
                disabled={id && index < statusIndex}
              >
                {status}
              </Option>
            ))}
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
