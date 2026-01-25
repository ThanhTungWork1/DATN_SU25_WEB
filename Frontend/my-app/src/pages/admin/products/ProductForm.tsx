import "../../../assets/styles/admin-responsive.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// SỬA LẠI: Tách import ra cho rõ ràng và chính xác
import {
  createProduct,
  getProduct,
  updateProduct,
  getProductVariants,
  getColors,
  getSizes,
} from "../../../api/product";
import { getCategories } from "../../../api/category"; // Import getCategories từ file riêng
import {
  Product,
  ProductVariant,
  Category,
  Color,
  Size,
} from "../../../types/ProductType";
import {
  Form,
  Input,
  Button,
  Typography,
  Select,
  message,
  Space,
  Divider,
  Row,
  Col,
  Upload,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PRODUCT_STATUS_OPTIONS = [
  { value: true, label: "Đang bán" },
  { value: false, label: "Ngừng bán/Hết hàng" },
];

const MATERIAL_OPTIONS = [
  { value: "Cotton", label: "Cotton" },
  { value: "Polyester", label: "Polyester" },
  { value: "Plastic", label: "Plastic" },
  { value: "Spandex", label: "Spandex" },
  { value: "Fleece", label: "Fleece" },
];

// Interface để quản lý state của các file ảnh biến thể
interface VariantImageState {
  [key: number]: UploadFile[]; // key là index của biến thể
}

export default function ProductForm() {
  const [formRef] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [mainImageFileList, setMainImageFileList] = useState<UploadFile[]>([]);
  const [hoverImageFileList, setHoverImageFileList] = useState<UploadFile[]>(
    []
  );
  const [variantImageFiles, setVariantImageFiles] = useState<VariantImageState>(
    {}
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [catRes, colorRes, sizeRes] = await Promise.all([
          getCategories(),
          getColors(),
          getSizes(),
        ]);
        setCategories(
          Array.isArray((catRes as any).data?.data)
            ? (catRes as any).data.data
            : (catRes as any).data || []
        );
        setColors((colorRes as any).data?.data || (colorRes as any).data || []);
        setSizes((sizeRes as any).data?.data || (sizeRes as any).data || []);

        if (isEditing) {
          const productId = Number(id);
          const [productRes, variantsRes] = await Promise.all([
            getProduct(productId),
            getProductVariants(productId),
          ]);

          const productData: Product =
            (productRes as any).data?.data || (productRes as any).data;

          if (
            productData &&
            typeof productData === "object" &&
            productData.id
          ) {
            const variantsData: ProductVariant[] = Array.isArray(
              (variantsRes as any).data?.data
            )
              ? (variantsRes as any).data.data
              : (variantsRes as any).data || [];

            console.log("🔍 ProductForm - Product Data:", productData);
            console.log("🔍 ProductForm - Variants Data:", variantsData);

            formRef.setFieldsValue({
              ...productData,
              material: productData.material
                ? String(productData.material)
                    .split(",")
                    .map((item) => item.trim())
                : [],
              variants: variantsData.map((v) => ({
                ...v,
                variant_price: v.price, // Map price thành variant_price cho form
              })),
            });

            // Set main image
            if (productData.image_url)
              setMainImageFileList([
                {
                  uid: "-1",
                  name: "main_image.png",
                  status: "done",
                  url: productData.image_url,
                },
              ]);

            // Set hover image
            if (productData.hover_image_url)
              setHoverImageFileList([
                {
                  uid: "-2",
                  name: "hover_image.png",
                  status: "done",
                  url: productData.hover_image_url,
                },
              ]);

            // Load ảnh variants
            const variantImages: VariantImageState = {};
            variantsData.forEach((variant, index) => {
              if (variant.image_url) {
                variantImages[index] = [
                  {
                    uid: `variant-${index}`,
                    name: `variant_${index}.png`,
                    status: "done",
                    url: variant.image_url,
                  },
                ];
              }
            });
            setVariantImageFiles(variantImages);
          } else {
            message.error("Không tìm thấy dữ liệu sản phẩm hợp lệ.");
          }
        } else {
          formRef.setFieldsValue({
            status: true,
            sold: 0,
            variants: [{ stock: 0, price: 0 }],
          });
        }
      } catch (error: any) {
        console.error("Lỗi tải dữ liệu ban đầu:", error);
        if (error.response?.status === 404) {
          message.error("Không tìm thấy sản phẩm.");
          navigate("/admin/products");
        } else if (error.response?.status === 401) {
          message.error("Phiên đăng nhập đã hết hạn.");
          navigate("/login");
        } else {
          message.error("Lỗi khi tải dữ liệu ban đầu. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id, isEditing, formRef, navigate]);

  // Helper function to generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, "a")
      .replace(/[éèẻẽẹêếềểễệ]/g, "e")
      .replace(/[íìỉĩị]/g, "i")
      .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, "o")
      .replace(/[úùủũụưứừửữự]/g, "u")
      .replace(/[ýỳỷỹỵ]/g, "y")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const onFinish = async (values: any) => {
    const formData = new FormData();

    // Generate slug if not provided or empty
    if (!values.slug || values.slug.trim() === "") {
      if (!values.name || values.name.trim() === "") {
        message.error("Tên sản phẩm không được để trống!");
        return;
      }
      values.slug = generateSlug(values.name);
    }

    // Validate slug
    if (!values.slug) {
      message.error("Không thể tạo slug từ tên sản phẩm!");
      return;
    }

    Object.keys(values).forEach((key) => {
      if (
        key !== "variants" &&
        values[key] !== undefined &&
        values[key] !== null
      ) {
        if (key === "material" && Array.isArray(values[key]))
          formData.append(key, values[key].join(", "));
        else if (key === "status")
          formData.append(key, values[key] ? "1" : "0");
        else formData.append(key, values[key]);
      }
    });

    // Gửi variants dưới dạng array
    if (values.variants && Array.isArray(values.variants)) {
      values.variants.forEach((variant: any, index: number) => {
        Object.keys(variant).forEach((key) => {
          if (variant[key] !== undefined && variant[key] !== null) {
            formData.append(`variants[${index}][${key}]`, variant[key]);
          }
        });
      });
    }

    // Handle main image - send new file or indicate removal
    if (mainImageFileList.length > 0) {
      if (mainImageFileList[0].originFileObj) {
        formData.append("image", mainImageFileList[0].originFileObj);
      }
    } else if (isEditing) {
      formData.append("remove_image", "1");
    }

    // Handle hover image - send new file or indicate removal
    if (hoverImageFileList.length > 0) {
      if (hoverImageFileList[0].originFileObj) {
        // New hover image uploaded
        formData.append("hover_image", hoverImageFileList[0].originFileObj);
      }
    } else if (isEditing) {
      // Hover image was removed during editing
      formData.append("remove_hover_image", "1");
    }

    // Handle variant images - send new files or indicate removal
    Object.keys(variantImageFiles).forEach((index) => {
      const fileList = variantImageFiles[Number(index)];
      if (fileList && fileList.length > 0) {
        if (fileList[0].originFileObj) {
          // New variant image uploaded
          formData.append(
            `variant_images[${index}]`,
            fileList[0].originFileObj
          );
        }
      } else if (isEditing) {
        // Variant image was removed during editing
        formData.append(`remove_variant_image[${index}]`, "1");
      }
    });

    // Log FormData contents before sending
    console.log("=== FORMDATA CONTENTS ===");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      console.log("=== SENDING REQUEST ===");
      console.log("isEditing:", isEditing);
      console.log("Product ID:", id);

      let response;
      if (isEditing) {
        response = await updateProduct(Number(id), formData);
      } else {
        response = await createProduct(formData);
      }

      console.log("=== API RESPONSE ===");
      console.log("Response:", response);

      message.success(
        `${isEditing ? "Cập nhật" : "Tạo mới"} sản phẩm thành công!`
      );
      // Điều hướng và buộc tải lại trang để cập nhật danh sách
      navigate("/admin/products");
      setTimeout(() => {
        window.location.reload();
      }, 300); // Đợi một chút để message hiển thị
    } catch (error: any) {
      console.error("Lỗi gửi form sản phẩm:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      console.error("Error status:", error.response?.status);

      if (error.response?.data?.errors) {
        // Laravel validation errors
        Object.entries(error.response.data.errors).forEach(([key, value]) => {
          const messages = value as string[];
          messages.forEach((msg) => message.error(`${key}: ${msg}`));
        });
      } else if (error.response?.data?.message) {
        // API error message
        message.error(error.response.data.message);
      } else if (error.response?.status === 500) {
        message.error(
          "Lỗi server nội bộ. Vui lòng thử lại sau hoặc liên hệ admin."
        );
      } else if (error.response?.status === 422) {
        message.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.");
      } else if (error.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
      } else {
        message.error(
          `Lỗi khi ${isEditing ? "cập nhật" : "tạo mới"} sản phẩm: ${error.message || "Không xác định"}`
        );
      }
    }
  };

  // Helper function để validate file ảnh
  const validateImageFile = (file: File): boolean => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/webp",
    ];
    const isValidType = allowedTypes.includes(file.type);
    const isValidSize = file.size / 1024 / 1024 < 2; // 2MB limit

    if (!isValidType) {
      message.error("Chỉ chấp nhận file ảnh: JPEG, PNG, JPG, GIF, WEBP!");
      return false;
    }
    if (!isValidSize) {
      message.error("File ảnh phải nhỏ hơn 2MB!");
      return false;
    }
    return true;
  };

  const mainImageUploadProps: UploadProps = {
    onRemove: () => {
      setMainImageFileList([]);
    },
    onChange: ({ fileList }) => {
      setMainImageFileList(fileList);
    },
    beforeUpload: (file) => {
      return validateImageFile(file) ? false : Upload.LIST_IGNORE;
    },
    fileList: mainImageFileList,
    listType: "picture",
    maxCount: 1,
    accept: "image/jpeg,image/png,image/jpg,image/gif,image/webp",
  };

  const hoverImageUploadProps: UploadProps = {
    onRemove: () => {
      setHoverImageFileList([]);
    },
    onChange: ({ fileList }) => {
      setHoverImageFileList(fileList);
    },
    beforeUpload: (file) => {
      return validateImageFile(file) ? false : Upload.LIST_IGNORE;
    },
    fileList: hoverImageFileList,
    listType: "picture",
    maxCount: 1,
    accept: "image/jpeg,image/png,image/jpg,image/gif,image/webp",
  };

  const getVariantImageUploadProps = (index: number): UploadProps => ({
    onRemove: () => {
      setVariantImageFiles((prev) => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
    },
    onChange: ({ fileList }) => {
      setVariantImageFiles((prev) => ({
        ...prev,
        [index]: fileList,
      }));
    },
    beforeUpload: (file) => {
      return validateImageFile(file) ? false : Upload.LIST_IGNORE;
    },
    fileList: variantImageFiles[index] || [],
    listType: "picture",
    maxCount: 1,
    accept: "image/jpeg,image/png,image/jpg,image/gif,image/webp",
  });

  if (loading) return <Title level={4}>Đang tải dữ liệu...</Title>;

  return (
    <div>
      <Title level={3}>
        {isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
      </Title>
      <Form form={formRef} onFinish={onFinish} layout="vertical">
        <Divider orientation="left">Thông tin chung sản phẩm</Divider>
        <Form.Item
          label="Tên sản phẩm"
          name="name"
          rules={[{ required: true }]}
        >
          <Input
            autoComplete="off"
            onChange={(e) => {
              const name = e.target.value;
              const currentSlug = formRef.getFieldValue("slug");
              // Only auto-generate slug if current slug is empty or was auto-generated
              if (!currentSlug || currentSlug.trim() === "") {
                const newSlug = generateSlug(name);
                formRef.setFieldValue("slug", newSlug);
              }
            }}
          />
        </Form.Item>
        <Form.Item label="Slug" name="slug">
          <Input
            placeholder="Tự động tạo từ tên sản phẩm"
            autoComplete="off"
            addonBefore="/"
          />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Giá bán chung"
              name="price"
              rules={[{ required: true }]}
            >
              <Input type="number" min={0} autoComplete="off" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Giá cũ" name="old_price">
              <Input type="number" min={0} autoComplete="off" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="Danh mục"
          name="category_id"
          rules={[{ required: true }]}
        >
          <Select placeholder="Chọn danh mục">
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Chất liệu" name="material">
          <Select mode="multiple" placeholder="Chọn các loại chất liệu">
            {MATERIAL_OPTIONS.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true }]}
        >
          <Select>
            {PRODUCT_STATUS_OPTIONS.map((opt) => (
              <Option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Ảnh chính"
          rules={[
            {
              required: !isEditing && mainImageFileList.length === 0,
              message: "Vui lòng tải lên ảnh chính",
            },
          ]}
        >
          <Upload {...mainImageUploadProps}>
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>
        </Form.Item>
        <Form.Item label="Ảnh phụ (hover)">
          <Upload {...hoverImageUploadProps}>
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>
        </Form.Item>
        <Form.Item label="Mô tả" name="description">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item label="Số lượng đã bán" name="sold">
          <Input type="number" min={0} readOnly={isEditing} />
        </Form.Item>

        <Divider orientation="left">Quản lý Biến thể Sản phẩm</Divider>
        <Form.List
          name="variants"
          rules={[
            {
              validator: async (_, variants) => {
                if (!variants || variants.length < 1) {
                  return Promise.reject(
                    new Error("Phải có ít nhất 1 biến thể")
                  );
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                  wrap={true}
                >
                  <Form.Item {...restField} name={[name, "id"]} hidden />
                  <Form.Item
                    {...restField}
                    name={[name, "color_id"]}
                    rules={[{ required: true }]}
                    style={{ minWidth: 120 }}
                  >
                    <Select placeholder="Màu sắc">
                      {colors.map((c) => (
                        <Option key={c.id} value={c.id}>
                          {c.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "size_id"]}
                    rules={[{ required: true }]}
                    style={{ minWidth: 120 }}
                  >
                    <Select placeholder="Kích thước">
                      {sizes.map((s) => (
                        <Option key={s.id} value={s.id}>
                          {s.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "stock"]}
                    rules={[{ required: true }]}
                    style={{ width: 100 }}
                  >
                    <Input
                      type="number"
                      min={0}
                      placeholder="Số lượng còn lại"
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "variant_price"]}
                    rules={[{ required: true, message: "Vui lòng nhập giá" }]}
                    style={{ width: 120 }}
                  >
                    <Input type="number" min={0} placeholder="Giá biến thể" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "sku"]}
                    style={{ flexGrow: 1, minWidth: 150 }}
                  >
                    <Input placeholder="SKU (tùy chọn)" />
                  </Form.Item>
                  <Form.Item>
                    <Upload {...getVariantImageUploadProps(name)}>
                      <Button icon={<UploadOutlined />} size="small">
                        Ảnh
                      </Button>
                    </Upload>
                  </Form.Item>

                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add({ stock: 0, price: 0 })}
                  block
                  icon={<PlusOutlined />}
                >
                  Thêm biến thể
                </Button>
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
