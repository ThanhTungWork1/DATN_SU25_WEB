import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { TokenManager } from "../../../utils/tokenUtils";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  Space,
  Alert,
  Image,
  Checkbox,
  message,
  Steps,
  Tag
} from "antd";
import {
  ShoppingOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  GiftOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

type Ward = { code: number; name: string };
type District = { code: number; name: string; wards: Ward[] };
type Province = { code: number; name: string; districts: District[] };
type Product = { id: string; name: string; quantity: number; price: number; color?: string; size?: string; variant_id?: number; };

const paymentMethods = [
  { value: "COD", label: "Trả tiền mặt khi nhận hàng (COD)" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng" },
  { value: "EWALLET", label: "Ví điện tử (Momo/ZaloPay)" },
];

const CheckoutPage = () => {
  const { state } = useLocation();
  const { selectedProducts = [], totalAmount = 0 }: {
    selectedProducts: Product[];
    totalAmount: number;
  } = state || {};

  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Nếu không có dữ liệu từ state, lấy từ localStorage
  const [cartItems, setCartItems] = useState<Product[]>(() => {
    if (selectedProducts.length > 0) return selectedProducts;
    
    const stored = localStorage.getItem("cartItems");
    if (stored) {
      try {
        const items = JSON.parse(stored);
        return items
          .filter((item: any) => item && item.id !== undefined && item.id !== null)
          .map((item: any) => ({
            id: String(item.id || ''),
            name: item.name || '',
            quantity: Number(item.quantity) || 0,
            price: Number(item.price) || 0,
            color: item.color || '',
            size: item.size || '',
            variant_id: item.variant_id || null // Thêm variant_id
          }));
      } catch (error) {
        console.error('Error parsing cart items:', error);
        return [];
      }
    }
    return [];
  });

  const [calculatedTotal, setCalculatedTotal] = useState(() => {
    if (totalAmount > 0) return totalAmount;
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);
  });

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  const mbAccount = "0686809012005";
  const mbBankCode = "970422";
  const qrTemplate = "compact";
  const momoPhone = "0867426658";
  const momoName = "LÊ KHẢI HOÀN";

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    // **FIX: Sử dụng TokenManager để kiểm tra đúng user token**
    const userToken = TokenManager.getUserToken();
    const userStr = localStorage.getItem("user");
    
    console.log('🛒 Checkout - Token check:', {
      userToken: !!userToken,
      userStr: !!userStr,
      hasUserData: !!userStr
    });
    
    // Kiểm tra user token thay vì role
    if (userToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserInfo(user);
        // Cập nhật form với thông tin user
        form.setFieldsValue({
          fullName: user.name || user.username || user.full_name || '',
          phone: user.phone || user.phone_number || '',
          email: user.email || ''
        });
        console.log('✅ User info loaded for checkout:', user.name);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      // **FIX: Chỉ hiện thông báo khi thực sự không có user token**
      console.log('❌ No user token found, redirecting to login');
      message.warning("Vui lòng đăng nhập để thanh toán!");
      navigate("/login");
    }
  }, [form, navigate]);

  useEffect(() => {
    axios.get<Province[]>("https://provinces.open-api.vn/api/?depth=3")
      .then(res => setProvinces(res.data))
      .catch(() => message.error("Không thể tải địa chỉ"));
  }, []);

  // Cập nhật calculatedTotal khi cartItems thay đổi
  useEffect(() => {
    if (totalAmount > 0) {
      setCalculatedTotal(totalAmount);
    } else if (cartItems && cartItems.length > 0) {
      const total = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
      setCalculatedTotal(total);
    } else {
      setCalculatedTotal(0);
    }
  }, [cartItems, totalAmount]);

  const handleProvinceChange = (provinceName: string) => {
    const selected = provinces.find(p => p.name === provinceName);
    if (selected) {
      setDistricts(selected.districts || []);
    setWards([]);
      form.setFieldsValue({
        district: undefined,
        ward: undefined
      });
    }
  };

  const handleDistrictChange = (districtName: string) => {
    const selected = districts.find(d => d.name === districtName);
    if (selected) {
      setWards(selected.wards || []);
      form.setFieldsValue({
        ward: undefined
      });
    }
  };

  const handleOrder = async (values: any) => {
    setLoading(true);
    
    try {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
        message.error("Vui lòng đăng nhập!");
      navigate("/login");
      return;
    }
    
      const user = JSON.parse(userStr);
      if (!user || !user.id) {
        message.error("Vui lòng đăng nhập!");
      navigate("/login");
      return;
    }

    // Debug: Log cartItems để kiểm tra structure
    console.log('=== CHECKOUT DEBUG ===');
    console.log('cartItems:', cartItems);
    console.log('user:', user);
    
    const orderData = {
        shipping_address: `${values.street}, ${values.ward}, ${values.district}, ${values.province}`,
        shipping_phone: values.phone,
        shipping_name: values.fullName,
        customer_email: values.email || user.email || 'customer@example.com', // Thêm trường customer_email
        note: values.orderNotes,
        items: cartItems.map(item => {
          // Debug: Log từng item để xem có variant_id không
          console.log('Processing cart item:', item);
          const variantId = item.variant_id || parseInt(item.id) || 1;
          const price = Number(item.price);
          const quantity = Number(item.quantity);
          console.log(`Item ${item.name}:`);
          console.log(`  - variant_id: ${variantId} (from ${item.variant_id} || ${item.id})`);
          console.log(`  - price: ${price} (original: ${item.price}, type: ${typeof item.price})`);
          console.log(`  - quantity: ${quantity} (original: ${item.quantity})`);
          console.log(`  - subtotal: ${price * quantity}`);
          
          return {
            variant_id: variantId,
            quantity: quantity,
            price: price
          };
        })
      };
      
      console.log('Final orderData:', orderData);

      if (values.paymentMethod === "EWALLET") {
        message.info("Vui lòng quét mã QR và chuyển khoản xong hãy nhấn OK.");
      }

      const res = await fetch("http://localhost:8000/api/client/orders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TokenManager.getToken()}`
        },
        body: JSON.stringify(orderData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi server");
      }
      
      message.success("Đặt hàng thành công!");
      navigate("/orders");
    } catch (error: any) {
      console.error("Lỗi đặt hàng:", error);
      message.error(`Xảy ra lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const shippingFee = calculatedTotal >= 500000 ? 0 : 30000;
  const finalTotal = calculatedTotal + shippingFee;

  // Hiển thị thông tin phí giao hàng
  const getShippingInfo = () => {
    if (calculatedTotal >= 500000) {
      return {
        fee: 0,
        text: "Miễn phí (Đơn hàng >= 500.000 VND)",
        color: "green"
      };
    } else {
      return {
        fee: 30000,
        text: (30000).toLocaleString('vi-VN') + ' VND',
        color: "default"
      };
    }
  };

  const shippingInfo = getShippingInfo();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          <ShoppingOutlined style={{ marginRight: 8 }} />
          Thanh toán
        </Title>

        <Row gutter={24}>
          {/* Thông tin thanh toán */}
          <Col xs={24} lg={16}>
            <Card title="THÔNG TIN THANH TOÁN">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleOrder}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="fullName"
                      label="Họ và tên *"
                      rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    >
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label="Số điện thoại *"
                      rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="email"
                  label="Địa chỉ email (tuỳ chọn)"
                >
                  <Input />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="province"
                      label="Tỉnh/Thành phố *"
                      rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }]}
                    >
                      <Select
                        placeholder="Chọn Tỉnh/Thành"
                        onChange={handleProvinceChange}
                        showSearch
                        filterOption={(input, option) =>
                          option?.children?.toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {provinces.map(p => (
                          <Option key={p.code} value={p.name}>{p.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="district"
                      label="Quận/Huyện *"
                      rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}
                    >
                      <Select
                        placeholder="Chọn Quận/Huyện"
                        onChange={handleDistrictChange}
                        disabled={!districts.length}
                        showSearch
                        filterOption={(input, option) =>
                          option?.children?.toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {districts.map(d => (
                          <Option key={d.code} value={d.name}>{d.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="ward"
                      label="Xã/Phường *"
                      rules={[{ required: true, message: 'Vui lòng chọn xã/phường!' }]}
                    >
                      <Select
                        placeholder="Chọn Xã/Phường"
                        disabled={!wards.length}
                        showSearch
                        filterOption={(input, option) =>
                          option?.children?.toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {wards.map(w => (
                          <Option key={w.code} value={w.name}>{w.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="street"
                  label="Địa chỉ *"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                  <Input placeholder="Ví dụ: Số 20, ngõ 90" />
                </Form.Item>

                <Form.Item
                  name="orderNotes"
                  label="Ghi chú đơn hàng (tuỳ chọn)"
                >
                  <TextArea
                    rows={3}
                    placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                  />
                </Form.Item>

                <Divider />

                <Form.Item
                  name="paymentMethod"
                  label="Phương thức thanh toán *"
                  rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán!' }]}
                >
                  <Select placeholder="Chọn phương thức thanh toán">
                    {paymentMethods.map(method => (
                      <Option key={method.value} value={method.value}>
                        {method.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* QR Code hiển thị dựa trên phương thức thanh toán */}
                {form.getFieldValue('paymentMethod') === 'BANK_TRANSFER' && (
                  <Card size="small" title="QR chuyển khoản MB Bank" style={{ marginTop: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                      <Image
                  src={`https://img.vietqr.io/image/${mbBankCode}-${mbAccount}-${qrTemplate}.png`}
                  alt="QR MB Bank"
                        width={200}
                        height={200}
                      />
                      <div style={{ marginTop: 16 }}>
                        <Text strong>Số TK: {mbAccount}</Text><br />
                        <Text strong>Ngân hàng: MB Bank</Text><br />
                        <Text strong>Chủ TK: LÊ KHẢI HOÀN</Text>
                      </div>
              </div>
                  </Card>
                )}

                {form.getFieldValue('paymentMethod') === 'EWALLET' && (
                  <Card size="small" title="QR thanh toán ví Momo" style={{ marginTop: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                      <Image
                  src="/qr-momo.png"
                  alt="QR Momo"
                        width={200}
                        height={200}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                      />
                      <div style={{ marginTop: 16 }}>
                        <Text strong>Số điện thoại: {momoPhone}</Text><br />
                        <Text strong>Chủ ví: {momoName}</Text>
                      </div>
                    </div>
                  </Card>
                )}

                <Form.Item>
                  <Checkbox required>
                    Tôi đã đọc và đồng ý với điều khoản và điều kiện của website *
                  </Checkbox>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    size="large"
                    danger
                    htmlType="submit"
                    loading={loading}
                    style={{ width: '100%', height: 48 }}
                  >
                    ĐẶT HÀNG
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Đơn hàng của bạn */}
          <Col xs={24} lg={8}>
            <Card title="ĐƠN HÀNG CỦA BẠN">
              <Space direction="vertical" style={{ width: '100%' }}>
                {/* Sản phẩm */}
                <div>
                  <Text strong>SẢN PHẨM</Text>
                  {cartItems && cartItems.length > 0 ? (
                    cartItems.map(item => (
                      <div key={item.id} style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>{item.name} × {item.quantity}</Text>
                          <Text strong>{(item.price * item.quantity).toLocaleString('vi-VN')} VND</Text>
                        </div>
                        {(item.color || item.size) && (
                          <div style={{ marginTop: 4 }}>
                            <Space>
                              {item.color && <Tag color="blue">{item.color.toUpperCase()}</Tag>}
                              {item.size && <Tag color="green">{item.size.toUpperCase()}</Tag>}
                            </Space>
              </div>
            )}
                      </div>
                    ))
                  ) : (
                    <Text type="secondary">Không có sản phẩm nào trong giỏ hàng</Text>
                  )}
                </div>

                <Divider />

                {/* Tổng tiền */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Tạm tính:</Text>
                  <Text strong>{calculatedTotal.toLocaleString('vi-VN')} VNĐ</Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Giao hàng:</Text>
                  <Text strong>
                    {shippingInfo.text}
                  </Text>
                </div>

                {/* Thông tin phí giao hàng */}
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  <Text type="secondary">
                    {calculatedTotal >= 500000 
                      ? "✓ Miễn phí giao hàng cho đơn hàng từ 500.000 VNĐ"
                      : `Phí giao hàng: 30.000 VNĐ (Miễn phí từ 500.000 VNĐ)`
                    }
                  </Text>
                </div>

                <Divider />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 16 }}>Tổng:</Text>
                  <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>
                    {finalTotal.toLocaleString('vi-VN')} VNĐ
                  </Text>
          </div>

                {/* Phiếu ưu đãi */}
                <div style={{ marginTop: 16 }}>
                  {!showCouponInput ? (
                    <Button
                      type="link"
                      icon={<GiftOutlined />}
                      onClick={() => setShowCouponInput(true)}
                      style={{ padding: 0 }}
                    >
                      Bạn có mã ưu đãi? Ấn vào đây để nhập mã
                    </Button>
                  ) : (
                    <Space.Compact style={{ width: '100%' }}>
                      <Input placeholder="Mã ưu đãi" />
                      <Button>Áp dụng</Button>
                    </Space.Compact>
                  )}
        </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CheckoutPage;
