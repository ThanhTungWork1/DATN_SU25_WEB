

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
import { Form, Input, Button, Typography, Select, message, Upload, Space, Tag, Divider, Row, Col } from "antd";
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Định nghĩa trạng thái cho Product
const PRODUCT_STATUS_OPTIONS = [
  { value: "active", label: "Đang bán" },
  { value: "out_of_stock", label: "Hết hàng" },
  { value: "inactive", label: "Ngừng bán" },
];

export default function ProductForm() {
  const [formRef] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams(); // id có thể là string hoặc undefined
  const isEditing = !!id; // Biến cờ kiểm tra đang ở chế độ chỉnh sửa

  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]); // State để quản lý các biến thể

  useEffect(() => {
    // Fetch danh mục, màu sắc, kích thước khi component mount
    const fetchSelectOptions = async () => {
      try {
        const [catRes, colorRes, sizeRes] = await Promise.all([
          getCategories(),
          getColors(),
          getSizes(),
        ]);
        setCategories(catRes.data);
        setColors(colorRes.data);
        setSizes(sizeRes.data);
      } catch (error) {
        message.error("Lỗi khi tải dữ liệu tùy chọn.");
        console.error("Fetch select options error:", error);
      }
    };

    fetchSelectOptions();

    // Fetch dữ liệu sản phẩm nếu đang ở chế độ chỉnh sửa
    if (isEditing) {
      const productId = Number(id); // Chuyển id sang number
      Promise.all([
        getProduct(productId),
        getProductVariants(productId) // Lấy các biến thể của sản phẩm
      ])
        .then(([productRes, variantsRes]) => {
          const productData: Product = productRes.data;
          const variantsData: ProductVariant[] = variantsRes.data;

          // Chuyển đổi mảng URL hình ảnh thành chuỗi để hiển thị trong TextArea
          // Hoặc có thể dùng component Upload của Ant Design nếu muốn upload file
          formRef.setFieldsValue({
            ...productData,
            main_image: productData.main_image, // Ảnh chính
            images: productData.images ? productData.images.join('\n') : '', // Mảng ảnh phụ
            // Không set stock_quantity trực tiếp vào form sản phẩm chính
            // products.colors và products.sizes là mảng các ID, không phải tên
            // Nên không cần chuyển đổi ở đây, form sẽ handle các ID này
          });
          setProductVariants(variantsData); // Set biến thể cho state

        })
        .catch(() => {
          message.error("Không tìm thấy sản phẩm");
        });
    } else {
      // Thiết lập giá trị mặc định cho form khi tạo mới
      formRef.setFieldsValue({
        status: "active",
        old_price: null, // Mặc định không có giá cũ
        sold_count: 0, // Mặc định số lượng đã bán là 0
        images: '', // Mặc định không có ảnh phụ
        materials: [], // Mặc định không có chất liệu
      });
    }
  }, [id, isEditing]);


  const onFinish = async (values: any) => {
    // Chuẩn bị dữ liệu sản phẩm
    const productData: Partial<Product> = {
      name: values.name,
      description: values.description,
      price: Number(values.price),
      old_price: values.old_price ? Number(values.old_price) : null,
      status: values.status,
      slug: values.slug || values.name.toLowerCase().replace(/\s+/g, '-'), // Tự động tạo slug nếu không có
      category_id: Number(values.category_id),
      main_image: values.main_image,
      images: values.images ? values.images.split('\n').filter(url => url.trim() !== '') : [], // Chuyển đổi chuỗi thành mảng URL
      materials: values.materials || [], // Đảm bảo là mảng
      sold_count: Number(values.sold_count) || 0,
      // colors và sizes trong product là các ID được chọn, không phải tên.
      // Laravel API sẽ tự xử lý các mối quan hệ này.
      colors: values.colors || [],
      sizes: values.sizes || []
    };

    try {
      let response;
      if (isEditing) {
        response = await updateProduct(Number(id), productData);
        message.success("Cập nhật sản phẩm thành công");
      } else {
        response = await createProduct(productData as Product); // json-server sẽ tạo id mới
        message.success("Tạo sản phẩm thành công");
      }

      const productId = response.data.id; // Lấy ID của sản phẩm vừa tạo/cập nhật

      // Xử lý Product Variants
      const existingVariantIds = new Set(productVariants.map(v => v.id));
      const submittedVariants = values.productVariants || [];
      const newVariantIds = new Set(submittedVariants.map((v: any) => v.id));

      // Xóa các biến thể đã bị loại bỏ
      for (const existingId of existingVariantIds) {
        if (!newVariantIds.has(existingId)) {
          await deleteProductVariant(existingId);
        }
      }

      // Tạo mới hoặc cập nhật các biến thể
      for (const variant of submittedVariants) {
        const variantData: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'> = {
          product_id: productId,
          color_id: variant.color_id,
          size_id: variant.size_id,
          stock_quantity: Number(variant.stock_quantity),
          image: variant.image || null,
          sku: variant.sku || `${productId}-${variant.color_id}-${variant.size_id}`
        };

        if (variant.id && existingVariantIds.has(variant.id)) {
          await updateProductVariant(variant.id, variantData);
        } else {
          await createProductVariant(variantData);
        }
      }

      navigate("/admin/products");
    } catch (error) {
      message.error(`Lỗi: ${isEditing ? "Cập nhật" : "Tạo mới"} sản phẩm.`);
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
        initialValues={{ status: "active", sold_count: 0 }}
      >
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
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          label="URL ảnh chính"
          name="main_image"
          rules={[{ required: true, message: "Vui lòng nhập URL ảnh chính" }]}
        >
          <Input placeholder="http://example.com/main-image.jpg" />
        </Form.Item>

        <Form.Item
          label="URL ảnh phụ (mỗi URL một dòng)"
          name="images"
          tooltip="Mỗi đường dẫn ảnh phụ trên một dòng mới."
        >
          <TextArea rows={4} placeholder="http://example.com/image1.jpg&#10;http://example.com/image2.jpg" />
        </Form.Item>

        <Form.Item
          label="Số lượng đã bán"
          name="sold_count"
        >
          <Input type="number" min={0} readOnly={isEditing} /> {/* Chỉ cho phép chỉnh sửa khi tạo mới, hoặc có thể ẩn đi */}
        </Form.Item>

        <Divider>Quản lý Biến thể Sản phẩm (Màu sắc, Kích thước, Tồn kho)</Divider>

        {/* Dynamic Form for Product Variants */}
        <Form.List name="productVariants">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'color_id']}
                    rules={[{ required: true, message: 'Vui lòng chọn màu' }]}
                    style={{ minWidth: 120 }}
                  >
                    <Select placeholder="Màu sắc">
                      {colors.map(color => (
                        <Option key={color.id} value={color.id}>{color.name}</Option>
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
                        <Option key={size.id} value={size.id}>{size.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
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