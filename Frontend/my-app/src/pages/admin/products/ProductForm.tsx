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
  createProductVariant,
  updateProductVariant,
  deleteProductVariant
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

  useEffect(() => {
    const fetchSelectOptions = async () => {
      try {
        const [catRes, colorRes, sizeRes] = await Promise.all([ getCategories(), getColors(), getSizes() ]);
        setCategories(Array.isArray(catRes.data.data) ? catRes.data.data : catRes.data);
        setColors(Array.isArray(colorRes.data.data) ? colorRes.data.data : colorRes.data);
        setSizes(Array.isArray(sizeRes.data.data) ? sizeRes.data.data : sizeRes.data);
      } catch (error) {
        message.error("Lỗi khi tải dữ liệu tùy chọn.");
      }
    };
    fetchSelectOptions();

    if (isEditing) {
        const productId = Number(id);
        Promise.all([
            getProduct(productId),
            getProductVariants(productId)
        ]).then(([productRes, variantsRes]) => {
            const apiResponseData = productRes.data;
            const productData: Product = apiResponseData.data;
            const variantsData: ProductVariant[] = Array.isArray(variantsRes.data.data) ? variantsRes.data.data : variantsRes.data;

            formRef.setFieldsValue({
                name: productData.name,
                slug: productData.slug,
                description: productData.description,
                price: productData.price,
                old_price: productData.old_price,
                status: productData.status,
                category_id: productData.category_id,
                material: productData.material ? productData.material.split(',').map(item => item.trim()) : [],
                discount: productData.discount,
                sold: productData.sold,
                variants: variantsData.map(v => ({
                    ...v,
                    color_id: v.color_id,
                    size_id: v.size_id,
                    stock_quantity: v.stock_quantity,
                    image: v.image || '',
                    sku: v.sku || ''
                }))
            });

            if (apiResponseData.image_url) {
                setMainImageFileList([{ uid: '-1', name: 'main_image.png', status: 'done', url: apiResponseData.image_url }]);
            }
            if (apiResponseData.hover_image_url) {
                setHoverImageFileList([{ uid: '-2', name: 'hover_image.png', status: 'done', url: apiResponseData.hover_image_url }]);
            }
        }).catch(err => {
            message.error("Lỗi khi tải dữ liệu sản phẩm.");
            console.error(err);
        });
    }
  }, [id, isEditing, formRef, navigate]);

  const onFinish = async (values: any) => {
    const formData = new FormData();

    formData.append('name', values.name);
    formData.append('description', values.description || '');
    formData.append('price', values.price);
    if (values.old_price) formData.append('old_price', values.old_price);
    
    // SỬA LỖI TẠI ĐÂY: Chuyển boolean thành 1 hoặc 0
    formData.append('status', values.status ? '1' : '0');

    formData.append('slug', values.slug || values.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''));
    formData.append('category_id', values.category_id);
    formData.append('material', Array.isArray(values.material) ? values.material.join(', ') : '');
    if (values.discount) formData.append('discount', values.discount);
    formData.append('sold', values.sold || 0);

    if (mainImageFileList.length > 0 && mainImageFileList[0].originFileObj) {
        formData.append('image', mainImageFileList[0].originFileObj);
    }
    if (hoverImageFileList.length > 0 && hoverImageFileList[0].originFileObj) {
        formData.append('hover_image', hoverImageFileList[0].originFileObj);
    }
    
    if (values.variants) {
        formData.append('variants', JSON.stringify(values.variants));
    }

    try {
      if (isEditing) {
        formData.append('_method', 'PUT');
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
    onRemove: () => setMainImageFileList([]),
    beforeUpload: (file) => { setMainImageFileList([file]); return false; },
    fileList: mainImageFileList, listType: "picture", maxCount: 1,
  };

  const hoverImageUploadProps: UploadProps = {
    onRemove: () => setHoverImageFileList([]),
    beforeUpload: (file) => { setHoverImageFileList([file]); return false; },
    fileList: hoverImageFileList, listType: "picture", maxCount: 1,
  };

  return (
    <div>
      <Title level={3}>{isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</Title>
      <Form form={formRef} onFinish={onFinish} layout="vertical" encType="multipart/form-data">
        <Divider orientation="left">Thông tin chung sản phẩm</Divider>
        
        <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Slug (URL thân thiện)" name="slug">
          <Input placeholder="Tự động tạo nếu để trống" />
        </Form.Item>
        <Form.Item label="Mô tả" name="description">
          <TextArea rows={4} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Giá bán" name="price" rules={[{ required: true, message: "Vui lòng nhập giá" }]}>
              <Input type="number" min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Giá cũ" name="old_price">
              <Input type="number" min={0} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Danh mục" name="category_id" rules={[{ required: true, message: "Vui lòng chọn" }]}>
          <Select placeholder="Chọn danh mục">
            {categories.map((cat) => (<Option key={cat.id} value={cat.id}>{cat.name}</Option>))}
          </Select>
        </Form.Item>
        <Form.Item label="Chất liệu" name="material">
            <Select mode="tags" placeholder="Chọn hoặc nhập chất liệu" />
        </Form.Item>
        <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
          <Select placeholder="Chọn trạng thái">
            {PRODUCT_STATUS_OPTIONS.map(opt => <Option key={opt.label} value={opt.value}>{opt.label}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item label="Ảnh chính" rules={[{ required: !isEditing && mainImageFileList.length === 0, message: "Vui lòng tải lên ảnh chính" }]}>
          <Upload {...mainImageUploadProps}>
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>
        </Form.Item>
        <Form.Item label="Ảnh phụ (hover)">
          <Upload {...hoverImageUploadProps}>
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>
        </Form.Item>
        <Form.Item label="Giảm giá" name="discount">
            <Input type="number" min={0} />
        </Form.Item>
        <Form.Item label="Số lượng đã bán" name="sold">
            <Input type="number" min={0} readOnly={isEditing} />
        </Form.Item>

        <Divider orientation="left">Quản lý Biến thể Sản phẩm</Divider>
        
        <Form.List name="variants">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline" wrap={true}>
                  <Form.Item {...restField} name={[name, 'id']} hidden />
                  <Form.Item {...restField} name={[name, 'color_id']} rules={[{ required: true, message: 'Chọn màu' }]} style={{ minWidth: 120 }}>
                    <Select placeholder="Màu sắc">
                      {colors.map(color => <Option key={color.id} value={color.id}>{color.name}</Option>)}
                    </Select>
                  </Form.Item>
                  <Form.Item {...restField} name={[name, 'size_id']} rules={[{ required: true, message: 'Chọn size' }]} style={{ minWidth: 120 }}>
                    <Select placeholder="Kích thước">
                      {sizes.map(size => <Option key={size.id} value={size.id}>{size.name}</Option>)}
                    </Select>
                  </Form.Item>
                  <Form.Item {...restField} name={[name, 'stock_quantity']} rules={[{ required: true, message: 'Nhập SL' }]} style={{ width: 100 }}>
                    <Input type="number" min={0} placeholder="Tồn kho" />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, 'image']} style={{ flexGrow: 1 }}>
                    <Input placeholder="URL ảnh biến thể (tùy chọn)" />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, 'sku']} style={{ flexGrow: 1 }}>
                    <Input placeholder="SKU (tùy chọn)" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm biến thể
                </Button>
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