import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Radio, 
  Row, 
  Col, 
  Typography, 
  Select, 
  message, 
  Divider,
  Spin 
} from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { TokenManager } from '../../../utils/tokenUtils';
import axios from 'axios';
import { 
  getProvinces, 
  getDistrictsByProvince, 
  getWardsByDistrict,
  getProvinceNameByCode,
  getDistrictNameByCode,
  getWardNameByCode,
  Province,
  District,
  Ward 
} from '../../../utils/vietnamAddressData';

const { Title, Text } = Typography;
const { Option } = Select;

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant_id?: string;
  product_id?: string;
}

interface Address {
  province: string;
  district: string;
  ward: string;
  street: string;
}

interface UserInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
  username: string;
}

const CheckoutPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  
  // Address dropdowns
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | undefined>();
  const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>();
  const [addressLoading, setAddressLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });

  useEffect(() => {
    // Load cart items from localStorage
    const savedCart = localStorage.getItem('cartItems');
    const savedSelected = localStorage.getItem('selectedItems');
    
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    
    if (savedSelected) {
      setSelectedItems(JSON.parse(savedSelected));
    }

    // Load user info and provinces
    loadUserInfo();
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    setAddressLoading(prev => ({ ...prev, provinces: true }));
    try {
      const provincesData = await getProvinces();
      setProvinces(provincesData);
    } catch (error) {
      console.error('Error loading provinces:', error);
      message.error('Không thể tải danh sách tỉnh thành');
    } finally {
      setAddressLoading(prev => ({ ...prev, provinces: false }));
    }
  };

  const loadUserInfo = async () => {
    try {
      const token = TokenManager.getUserToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/me', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const user = response.data;
      setUserInfo(user);
      
      // Pre-fill form with user info
      form.setFieldsValue({
        name: user.name || user.username || '',
        email: user.email || '',
        phone: user.phone || '',
      });

    } catch (error) {
      console.error('Error loading user info:', error);
      message.error('Không thể tải thông tin user');
      navigate('/login');
    }
  };

  const handleProvinceChange = async (provinceCode: number) => {
    console.log('Province selected:', provinceCode);
    setSelectedProvince(provinceCode);
    setSelectedDistrict(undefined);
    setDistricts([]);
    setWards([]);
    
    // Clear dependent form fields
    form.setFieldsValue({
      district: undefined,
      ward: undefined,
    });

    // Load districts
    setAddressLoading(prev => ({ ...prev, districts: true }));
    try {
      console.log('Loading districts for province:', provinceCode);
      const districtsData = await getDistrictsByProvince(provinceCode);
      console.log('Districts loaded:', districtsData);
      setDistricts(districtsData);
      
      if (districtsData.length === 0) {
        message.warning('Không tìm thấy quận/huyện cho tỉnh này');
      }
    } catch (error) {
      console.error('Error loading districts:', error);
      message.error('Không thể tải danh sách quận/huyện');
    } finally {
      setAddressLoading(prev => ({ ...prev, districts: false }));
    }
  };

  const handleDistrictChange = async (districtCode: number) => {
    console.log('District selected:', districtCode);
    setSelectedDistrict(districtCode);
    setWards([]);
    
    // Clear dependent form field
    form.setFieldsValue({
      ward: undefined,
    });

    // Load wards
    setAddressLoading(prev => ({ ...prev, wards: true }));
    try {
      console.log('Loading wards for district:', districtCode);
      const wardsData = await getWardsByDistrict(districtCode);
      console.log('Wards loaded:', wardsData);
      setWards(wardsData);
      
      if (wardsData.length === 0) {
        message.warning('Không tìm thấy phường/xã cho quận này');
      }
    } catch (error) {
      console.error('Error loading wards:', error);
      message.error('Không thể tải danh sách phường/xã');
    } finally {
      setAddressLoading(prev => ({ ...prev, wards: false }));
    }
  };

  const selectedProducts = cartItems.filter(item => selectedItems[item.id]);
  const calculatedTotal = selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = calculatedTotal >= 500000 ? 0 : 30000;
  const finalTotal = calculatedTotal + shippingFee;

  const handleOrder = async (values: any) => {
    setLoading(true);
    
    try {
      const token = TokenManager.getUserToken();
      if (!token || !userInfo) {
        message.error("Vui lòng đăng nhập để đặt hàng!");
        navigate("/login");
        return;
      }

      if (selectedProducts.length === 0) {
        message.error("Vui lòng chọn ít nhất một sản phẩm.");
        return;
      }

      // Get selected address text
      const selectedProvinceText = provinces.find(p => p.code === values.province)?.name || await getProvinceNameByCode(values.province);
      const selectedDistrictText = districts.find(d => d.code === values.district)?.name || await getDistrictNameByCode(values.district);
      const selectedWardText = wards.find(w => w.code === values.ward)?.name || await getWardNameByCode(values.ward);

      const orderData = {
        user_id: userInfo.id,
        customer_name: values.name || userInfo.name || userInfo.username || "Khách hàng",
        customer_email: values.email || userInfo.email || "",
        customer_phone: values.phone || userInfo.phone || "",
        shipping_address: `${values.street}, ${selectedWardText}, ${selectedDistrictText}, ${selectedProvinceText}`,
        total_amount: finalTotal,
        payment_method: paymentMethod,
        payment_status: "pending",
        order_status: "pending",
        notes: values.notes || "",
        items: selectedProducts.map(item => ({
          product_id: item.product_id || item.id,
          variant_id: item.variant_id || null,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
      };

      console.log('Order data:', orderData);

      if (paymentMethod === "EWALLET") {
        message.info("Vui lòng quét mã QR và chuyển khoản xong hãy nhấn OK.");
      }

      // Create order
      const response = await fetch("http://localhost:8000/api/client/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi server");
      }

      const result = await response.json();

      // Clear ordered items from cart
      const remainingItems = cartItems.filter(item => !selectedItems[item.id]);
      localStorage.setItem('cartItems', JSON.stringify(remainingItems));
      localStorage.removeItem('selectedItems');

      message.success("Đặt hàng thành công!");
      navigate("/", {
        state: {
          order_id: result.id,
          totalAmount: finalTotal,
          paymentMethod,
          items: selectedProducts,
          customerName: userInfo.name || userInfo.username,
        },
      });

    } catch (error: any) {
      console.error("Lỗi đặt hàng:", error);
      message.error(error.message || "Có lỗi xảy ra khi đặt hàng!");
    } finally {
      setLoading(false);
    }
  };

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

  if (!userInfo) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

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
                {/* User Information */}
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label="Họ và tên"
                      name="name"
                      rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                      <Input placeholder="Nhập họ và tên" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                      ]}
                    >
                      <Input placeholder="Nhập email" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Số điện thoại"
                      name="phone"
                      rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    >
                      <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider>Địa chỉ giao hàng</Divider>

                {/* Address Selection */}
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label="Tỉnh/Thành phố"
                      name="province"
                      rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }]}
                    >
                      <Select
                        placeholder="Chọn tỉnh/thành phố"
                        onChange={handleProvinceChange}
                        showSearch
                        optionFilterProp="children"
                        loading={addressLoading.provinces}
                        filterOption={(input, option) =>
                          (option?.children as string)?.toLowerCase()?.includes(input.toLowerCase())
                        }
                      >
                        {provinces.map((province) => (
                          <Option key={province.code} value={province.code}>
                            {province.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Quận/Huyện"
                      name="district"
                      rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}
                    >
                      <Select
                        placeholder="Chọn quận/huyện"
                        onChange={handleDistrictChange}
                        disabled={!selectedProvince}
                        showSearch
                        optionFilterProp="children"
                        loading={addressLoading.districts}
                        filterOption={(input, option) =>
                          (option?.children as string)?.toLowerCase()?.includes(input.toLowerCase())
                        }
                      >
                        {districts.map((district) => (
                          <Option key={district.code} value={district.code}>
                            {district.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Phường/Xã"
                      name="ward"
                      rules={[{ required: true, message: 'Vui lòng chọn phường/xã!' }]}
                    >
                      <Select
                        placeholder="Chọn phường/xã"
                        disabled={!selectedDistrict}
                        showSearch
                        optionFilterProp="children"
                        loading={addressLoading.wards}
                        filterOption={(input, option) =>
                          (option?.children as string)?.toLowerCase()?.includes(input.toLowerCase())
                        }
                      >
                        {wards.map((ward) => (
                          <Option key={ward.code} value={ward.code}>
                            {ward.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label="Địa chỉ cụ thể"
                      name="street"
                      rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể!' }]}
                    >
                      <Input placeholder="Số nhà, tên đường, hẻm..." />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Ghi chú" name="notes">
                  <Input.TextArea 
                    rows={3} 
                    placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                  />
                </Form.Item>

                <Form.Item label="Phương thức thanh toán">
                  <Radio.Group 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <Radio value="CASH">Thanh toán khi nhận hàng (COD)</Radio>
                    <Radio value="EWALLET">Chuyển khoản ngân hàng</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large" 
                    loading={loading}
                    style={{ width: '100%' }}
                  >
                    Đặt hàng
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Tóm tắt đơn hàng */}
          <Col xs={24} lg={8}>
            <Card title="TÓM TẮT ĐÔN HÀNG">
              {selectedProducts.map((item) => (
                <div key={item.id} style={{ display: 'flex', marginBottom: 16, alignItems: 'center' }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{ width: 60, height: 60, objectFit: 'cover', marginRight: 12 }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text strong>{item.name}</Text>
                    <div>
                      <Text type="secondary">SL: {item.quantity}</Text>
                      <Text style={{ float: 'right' }}>
                        {(item.price * item.quantity).toLocaleString('vi-VN')} VND
                      </Text>
                    </div>
                  </div>
                </div>
              ))}

              <Divider />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Tạm tính:</Text>
                <Text>{calculatedTotal.toLocaleString('vi-VN')} VND</Text>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Phí giao hàng:</Text>
                <Text style={{ color: shippingInfo.color === 'green' ? '#52c41a' : undefined }}>
                  {shippingInfo.text}
                </Text>
              </div>

              <Divider />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong size={16}>Tổng cộng:</Text>
                <Text strong size={16} style={{ color: '#ff4d4f' }}>
                  {finalTotal.toLocaleString('vi-VN')} VND
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CheckoutPage;