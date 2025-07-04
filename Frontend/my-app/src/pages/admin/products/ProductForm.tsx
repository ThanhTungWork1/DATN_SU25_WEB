import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProduct, getProduct, updateProduct } from "../../../api/product";
import { Form, Input, Button, Typography, Select, message } from "antd";

const { Title } = Typography;
const { Option } = Select;

export default function ProductForm() {
  const [formRef] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getProduct(id)
        .then((res) => {
          formRef.setFieldsValue(res.data);
        })
        .catch(() => {
          message.error("Không tìm thấy sản phẩm");
        });
    }
  }, [id]);

  const onFinish = async (values: any) => {
    if (id) {
      await updateProduct(id, values);
      message.success("Cập nhật thành công");
    } else {
      await createProduct(values);
      message.success("Tạo mới thành công");
    }
    navigate("/admin/products");
  };

  return (
    <div>
      <Title level={3}>{id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</Title>
      <Form
        form={formRef}
        onFinish={onFinish}
        layout="vertical"
        initialValues={{ status: true }}
      >
        <Form.Item
          label="Tên sản phẩm"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Giá"
          name="price"
          rules={[{ required: true, message: "Vui lòng nhập giá" }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label="Số lượng"
          name="quantity"
          rules={[{ required: true, message: "Vui lòng nhập số lượng tồn kho" }]}
        >
          <Input type="number" min={0} />
        </Form.Item>

        <Form.Item label="Mô tả" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label="Trạng thái" name="status">
          <Select>
            <Option value={true}>Còn hàng</Option>
            <Option value={false}>Hết hàng</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Ảnh sản phẩm (link ảnh)" name="image">
          <Input placeholder="Nhập đường dẫn ảnh" />
        </Form.Item>

        <Form.Item label="Danh mục (Category)" name="category">
          <Input />
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
