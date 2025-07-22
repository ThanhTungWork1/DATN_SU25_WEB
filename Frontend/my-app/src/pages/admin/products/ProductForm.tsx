import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  getProduct,
  updateProduct,
  getCategories,
  getColors,
  getSizes,
  getProductVariants,
} from "../../../api/product";
import { Product, ProductVariant, Category, Color, Size } from "../../../types/ProductType";
import { Form, Input, Button, Typography, Select, message, Space, Divider, Row, Col, Upload } from "antd";
import type { UploadFile, UploadProps } from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PRODUCT_STATUS_OPTIONS = [
  { value: true, label: "Đang bán" },
  { value: false, label: "Ngừng bán/Hết hàng" },
];

export default function ProductForm() {
  const [formRef] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [mainImageFileList, setMainImageFileList] = useState<UploadFile[]>([]);
  const [hoverImageFileList, setHoverImageFileList] = useState<UploadFile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [catRes, colorRes, sizeRes] = await Promise.all([ getCategories(), getColors(), getSizes() ]);
        setCategories(Array.isArray(catRes.data.data) ? catRes.data.data : catRes.data);
        setColors(Array.isArray(colorRes.data.data) ? colorRes.data.data : colorRes.data);
        setSizes(Array.isArray(sizeRes.data.data) ? sizeRes.data.data : sizeRes.data);

        if (isEditing) {
          const productId = Number(id);
          const [productRes, variantsRes] = await Promise.all([ getProduct(productId), getProductVariants(productId) ]);
          
          const productData: Product = productRes.data;
          
          if (productData) {
            const variantsData: ProductVariant[] = Array.isArray(variantsRes.data.data) ? variantsRes.data.data : variantsRes.data;

            formRef.setFieldsValue({
                ...productData,
                material: productData.material ? String(productData.material).split(',').map(item => item.trim()) : [],
                variants: variantsData.map(v => ({ ...v }))
            });

            if (productData.image_url) setMainImageFileList([{ uid: '-1', name: 'main_image.png', status: 'done', url: productData.image_url }]);
            if (productData.hover_image_url) setHoverImageFileList([{ uid: '-2', name: 'hover_image.png', status: 'done', url: productData.hover_image_url }]);
          } else {
            message.error("Không tìm thấy dữ liệu sản phẩm.");
          }
        } else {
            formRef.setFieldsValue({ status: true, sold: 0, variants: [{ stock: 0, price: 0 }] });
        }
      } catch (error) {
        message.error("Lỗi khi tải dữ liệu ban đầu.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, isEditing, formRef, navigate]);

  const onFinish = async (values: any) => {
    const formData = new FormData();

    Object.keys(values).forEach(key => {
        if (key !== 'variants' && values[key] !== undefined && values[key] !== null) {
            if (key === 'material' && Array.isArray(values[key])) formData.append(key, values[key].join(', '));
            else if (key === 'status') formData.append(key, values[key] ? '1' : '0');
            else formData.append(key, values[key]);
        }
    });
    
    if (values.variants) formData.append('variants', JSON.stringify(values.variants));

    if (mainImageFileList.length > 0 && mainImageFileList[0].originFileObj) {
        formData.append('image', mainImageFileList[0].originFileObj);
    }
    if (hoverImageFileList.length > 0 && hoverImageFileList[0].originFileObj) {
        formData.append('hover_image', hoverImageFileList[0].originFileObj);
    }
    
    try {
      if (isEditing) {
        await updateProduct(Number(id), formData);
      } else {
        await createProduct(formData);
      }
      message.success(`${isEditing ? "Cập nhật" : "Tạo mới"} sản phẩm thành công!`);
      navigate("/admin/products");
    } catch (error: any) {
        console.error("Lỗi gửi form sản phẩm:", error.response?.data || error);
        if (error.response?.data?.errors) {
            Object.entries(error.response.data.errors).forEach(([key, value]) => {
                const messages = value as string[];
                messages.forEach(msg => message.error(`${key}: ${msg}`));
            });
        } else {
            message.error(`Lỗi khi ${isEditing ? "cập nhật" : "tạo mới"} sản phẩm.`);
        }
    }
  };

  const mainImageUploadProps: UploadProps = {
    onRemove: () => { setMainImageFileList([]); },
    onChange: ({ fileList }) => { setMainImageFileList(fileList); },
    beforeUpload: () => false,
    fileList: mainImageFileList,
    listType: "picture",
    maxCount: 1,
  };

  const hoverImageUploadProps: UploadProps = {
    onRemove: () => { setHoverImageFileList([]); },
    onChange: ({ fileList }) => { setHoverImageFileList(fileList); },
    beforeUpload: () => false,
    fileList: hoverImageFileList,
    listType: "picture",
    maxCount: 1,
  };

  if (loading) return <Title level={4}>Đang tải dữ liệu...</Title>

  return (
    <div>
      <Title level={3}>{isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</Title>
      <Form form={formRef} onFinish={onFinish} layout="vertical">
        <Divider orientation="left">Thông tin chung sản phẩm</Divider>
        <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item label="Slug" name="slug"><Input placeholder="Tự động tạo nếu để trống" /></Form.Item>
        <Row gutter={16}>
            <Col span={12}><Form.Item label="Giá bán chung" name="price" rules={[{ required: true }]}><Input type="number" min={0} /></Form.Item></Col>
            <Col span={12}><Form.Item label="Giá cũ" name="old_price"><Input type="number" min={0} /></Form.Item></Col>
        </Row>
        <Form.Item label="Danh mục" name="category_id" rules={[{ required: true }]}><Select placeholder="Chọn danh mục">{categories.map((cat) => (<Option key={cat.id} value={cat.id}>{cat.name}</Option>))}</Select></Form.Item>
        <Form.Item label="Chất liệu" name="material"><Select mode="tags" placeholder="Chọn hoặc nhập chất liệu" /></Form.Item>
        <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}><Select>{PRODUCT_STATUS_OPTIONS.map(opt => <Option key={String(opt.value)} value={opt.value}>{opt.label}</Option>)}</Select></Form.Item>
        <Form.Item label="Ảnh chính" rules={[{ required: !isEditing && mainImageFileList.length === 0, message: "Vui lòng tải lên ảnh chính" }]}><Upload {...mainImageUploadProps}><Button icon={<UploadOutlined />}>Chọn file</Button></Upload></Form.Item>
        <Form.Item label="Ảnh phụ (hover)"><Upload {...hoverImageUploadProps}><Button icon={<UploadOutlined />}>Chọn file</Button></Upload></Form.Item>
        <Form.Item label="Mô tả" name="description"><TextArea rows={4} /></Form.Item>
        
        {/* SỬA LỖI: Thêm lại trường "Số lượng đã bán" */}
        <Form.Item label="Số lượng đã bán" name="sold">
            <Input type="number" min={0} readOnly={isEditing} />
        </Form.Item>
        
        <Divider orientation="left">Quản lý Biến thể Sản phẩm</Divider>
        <Form.List name="variants" rules={[{ validator: async (_, variants) => { if (!variants || variants.length < 1) { return Promise.reject(new Error('Phải có ít nhất 1 biến thể')); }}}]}>
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline" wrap={true}>
                  <Form.Item {...restField} name={[name, 'id']} hidden />
                  <Form.Item {...restField} name={[name, 'color_id']} rules={[{ required: true}]} style={{ minWidth: 120 }}><Select placeholder="Màu sắc">{colors.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}</Select></Form.Item>
                  <Form.Item {...restField} name={[name, 'size_id']} rules={[{ required: true}]} style={{ minWidth: 120 }}><Select placeholder="Kích thước">{sizes.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}</Select></Form.Item>
                  <Form.Item {...restField} name={[name, 'stock']} rules={[{ required: true}]} style={{ width: 100 }}><Input type="number" min={0} placeholder="Tồn kho" /></Form.Item>
                  <Form.Item {...restField} name={[name, 'price']} rules={[{ required: true}]} style={{ width: 120 }}><Input type="number" min={0} placeholder="Giá" /></Form.Item>
                  <Form.Item {...restField} name={[name, 'image']} style={{ flexGrow: 1, minWidth: 150 }}><Input placeholder="URL ảnh (tùy chọn)" /></Form.Item>
                  <Form.Item {...restField} name={[name, 'sku']} style={{ flexGrow: 1, minWidth: 150 }}><Input placeholder="SKU (tùy chọn)" /></Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add({ stock: 0, price: 0 })} block icon={<PlusOutlined />}>Thêm biến thể</Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {isEditing ? "Cập nhật sản phẩm" : "Tạo mới sản phẩm"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
