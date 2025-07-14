// src/pages/admin/products/ProductForm.tsx

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
import { Form, Input, Button, Typography, Select, message, Space, Divider, Row, Col } from "antd";
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

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

  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  useEffect(() => {
    const fetchSelectOptions = async () => {
      try {
        const [catRes, colorRes, sizeRes] = await Promise.all([
          getCategories(),
          getColors(),
          getSizes(),
        ]);
        
        setCategories(Array.isArray(catRes.data.data) ? catRes.data.data : catRes.data);
        setColors(Array.isArray(colorRes.data.data) ? colorRes.data.data : colorRes.data);
        setSizes(Array.isArray(sizeRes.data.data) ? sizeRes.data.data : sizeRes.data);

      } catch (error) {
        message.error("Lỗi khi tải dữ liệu tùy chọn (danh mục, màu, kích thước).");
        console.error("Fetch select options error:", error);
      }
    };

    fetchSelectOptions();

    if (isEditing) {
      const productId = Number(id);
      if (isNaN(productId)) {
        message.error("ID sản phẩm không hợp lệ.");
        navigate("/admin/products");
        return;
      }

      Promise.all([
        getProduct(productId),
        getProductVariants(productId) 
      ])
        .then(([productRes, variantsRes]) => {
          const productData: Product = productRes.data;
          
          const variantsData: ProductVariant[] = Array.isArray(variantsRes.data.data) ? variantsRes.data.data : variantsRes.data;

          console.log("Dữ liệu sản phẩm từ API:", productData);
          console.log("Dữ liệu biến thể từ API:", variantsData);

          formRef.setFieldsValue({
            ...productData,
            // SỬA: Đồng nhất tên trường cho ảnh chính và ảnh phụ
            main_image: productData.main_image || '', // Đảm bảo có giá trị
            hover_image: productData.hover_image || '', // Dùng hover_image cho ảnh phụ
            materials: productData.materials || [], 

            variants: variantsData.map(v => ({
              ...v,
              color_id: v.color_id === null ? undefined : v.color_id,
              size_id: v.size_id === null ? undefined : v.size_id,
              stock_quantity: v.stock_quantity === null || v.stock_quantity === undefined ? 0 : v.stock_quantity,
              image: v.image || '',
              sku: v.sku || ''
            }))
          });
        })
        .catch((error) => {
          message.error("Không tìm thấy sản phẩm hoặc lỗi tải dữ liệu.");
          console.error("Fetch product/variants error:", error);
        });
    } else {
      formRef.setFieldsValue({
        status: true, 
        old_price: null,
        sold_count: 0,
        main_image: '', // Khởi tạo giá trị rỗng
        hover_image: '', // Khởi tạo giá trị rỗng
        materials: [],
        variants: [{ color_id: undefined, size_id: undefined, stock_quantity: 0, image: '', sku: '' }]
      });
    }
  }, [id, isEditing, formRef, navigate]);

  const onFinish = async (values: any) => {
    const productData: Partial<Product> = {
      name: values.name,
      description: values.description,
      price: Number(values.price),
      old_price: values.old_price ? Number(values.old_price) : null,
      status: values.status,
      slug: values.slug || values.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),
      category_id: Number(values.category_id),
      // SỬA: Đồng nhất tên trường ảnh chính và ảnh phụ khi gửi đi
      main_image: values.main_image, // Dùng main_image
      hover_image: values.hover_image, // Dùng hover_image cho ảnh phụ
      materials: values.materials || [],
      sold_count: Number(values.sold_count) || 0,
      discount: values.discount ? Number(values.discount) : null, // Thêm trường discount
    };

    try {
      let productResponse;
      if (isEditing) {
        productResponse = await updateProduct(Number(id), productData);
      } else {
        productResponse = await createProduct(productData as Product);
      }

      const productId = productResponse.data.id;

      const submittedVariants: ProductVariant[] = values.variants || [];
      
      const existingVariantsRes = await getProductVariants(productId);
      const existingVariants: ProductVariant[] = Array.isArray(existingVariantsRes.data.data) ? existingVariantsRes.data.data : existingVariantsRes.data;
      
      const existingVariantIds = new Set(existingVariants.map(v => v.id));
      const newVariantIds = new Set(submittedVariants.map(v => v.id).filter(id_val => id_val !== undefined));

      const variantOperations: Promise<any>[] = [];

      for (const existingVariant of existingVariants) {
        if (!newVariantIds.has(existingVariant.id)) {
          variantOperations.push(deleteProductVariant(existingVariant.id));
        }
      }

      for (const variant of submittedVariants) {
        const variantDataToSend: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'> = {
          product_id: productId,
          color_id: Number(variant.color_id),
          size_id: Number(variant.size_id),
          stock_quantity: Number(variant.stock_quantity), // BỎ COMMENT NẾU BACKEND YÊU CẦU
          image: variant.image || null, 
          sku: variant.sku || `${productId}-${variant.color_id}-${variant.size_id}`
        };

        if (variant.id && existingVariantIds.has(variant.id)) {
          variantOperations.push(updateProductVariant(variant.id, variantDataToSend));
        } else {
          variantOperations.push(createProductVariant(variantDataToSend));
        }
      }

      await Promise.all(variantOperations);

      message.success(`${isEditing ? "Cập nhật" : "Tạo mới"} sản phẩm thành công!`);
      
      navigate("/admin/products");

    } catch (error: any) {
      let errorMessage = `Lỗi: ${isEditing ? "Cập nhật" : "Tạo mới"} sản phẩm.`;
      if (error.response && error.response.data) {
          if (error.response.data.message) {
              errorMessage += ` Chi tiết: ${error.response.data.message}`;
          }
          if (error.response.data.errors) {
              Object.values(error.response.data.errors).forEach((errMsgs: any) => {
                  errMsgs.forEach((msg: string) => message.error(msg));
              });
          }
      } else if (error.message) {
          errorMessage += ` Chi tiết: ${error.message}`;
      }
      message.error(errorMessage);
      console.error("Product form submission error:", error);
    }
  };

  return (
    <div>
      <Title level={3}>{isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</Title>
      <Form
        form={formRef}
        onFinish={onFinish}
        layout="vertical"
      >
        {/* Product General Information */}
        <Divider orientation="left">Thông tin chung sản phẩm</Divider>
        <Form.Item
          label="Tên sản phẩm"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Slug (URL thân thiện)"
          name="slug"
          tooltip="Slug sẽ được tự động tạo nếu để trống."
        >
          <Input placeholder="Ví dụ: ao-thun-nam-premium-cotton" />
        </Form.Item>

        <Form.Item
          label="Mô tả sản phẩm"
          name="description"
        >
          <TextArea rows={4} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Giá bán"
              name="price"
              rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
            >
              <Input type="number" min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Giá cũ (nếu có khuyến mãi)"
              name="old_price"
            >
              <Input type="number" min={0} placeholder="Để trống nếu không có giá cũ" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Danh mục"
          name="category_id"
          rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
        >
          <Select placeholder="Chọn danh mục">
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Chất liệu"
          name="materials"
          rules={[{ required: true, message: "Vui lòng chọn chất liệu" }]}
        >
          <Select mode="tags" placeholder="Chọn hoặc nhập chất liệu (ví dụ: cotton, polyester)">
            {/* Có thể thêm các option mặc định nếu có danh sách chất liệu sẵn */}
          </Select>
        </Form.Item>

        <Form.Item
          label="Trạng thái sản phẩm"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select placeholder="Chọn trạng thái">
            {PRODUCT_STATUS_OPTIONS.map((option) => (
              <Option key={option.value.toString()} value={option.value}> 
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="URL ảnh chính"
          name="main_image" // SỬA: Đổi tên thành main_image
          rules={[{ required: true, message: "Vui lòng nhập URL ảnh chính" }]}
        >
          <Input placeholder="http://example.com/main-image.jpg" />
        </Form.Item>

        <Form.Item
          label="URL ảnh phụ (mỗi URL một dòng)"
          name="hover_image" // SỬA: Đổi tên thành hover_image
          tooltip="Mỗi đường dẫn ảnh phụ trên một dòng mới."
        >
          <TextArea rows={4} placeholder="http://example.com/hover_image1.jpg&#10;http://example.com/hover_image2.jpg" />
        </Form.Item>
        
        <Form.Item
          label="Giảm giá" // Thêm trường giảm giá
          name="discount"
        >
          <Input type="number" min={0} placeholder="Số tiền giảm giá" />
        </Form.Item>

        <Form.Item
          label="Số lượng đã bán"
          name="sold_count"
        >
          <Input type="number" min={0} readOnly={isEditing} />
        </Form.Item>

        {/* Product Variants Management */}
        <Divider orientation="left">Quản lý Biến thể Sản phẩm</Divider>

        <Form.List name="variants">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline" wrap={true}>
                  <Form.Item {...restField} name={[name, 'id']} hidden />

                  <Form.Item
                    {...restField}
                    name={[name, 'color_id']}
                    rules={[{ required: true, message: 'Vui lòng chọn màu' }]}
                    style={{ minWidth: 120 }}
                  >
                    <Select placeholder="Màu sắc">
                      {colors.map(color => (
                        <Option key={color.id} value={color.id}>
                          {color.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'size_id']}
                    rules={[{ required: true, message: 'Vui lòng chọn kích thước' }]}
                    style={{ minWidth: 120 }}
                  >
                    <Select placeholder="Kích thước">
                      {sizes.map(size => (
                        <Option key={size.id} value={size.id}>
                          {size.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  {/* BỎ COMMENT: Thêm lại trường stock_quantity */}
                  <Form.Item
                    {...restField}
                    name={[name, 'stock_quantity']}
                    rules={[{ required: true, message: 'Vui lòng nhập tồn kho' }]}
                    style={{ width: 100 }}
                  >
                    <Input type="number" min={0} placeholder="Tồn kho" />
                  </Form.Item>
                   <Form.Item
                    {...restField}
                    name={[name, 'image']}
                    style={{ flexGrow: 1 }}
                  >
                    <Input placeholder="URL ảnh biến thể (tùy chọn)" />
                  </Form.Item>
                   <Form.Item
                    {...restField}
                    name={[name, 'sku']}
                    style={{ flexGrow: 1 }}
                  >
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
