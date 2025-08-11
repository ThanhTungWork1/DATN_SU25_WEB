import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../provider/AuthContext";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant_id?: number;
}

interface Address {
  name: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  province: string;
}

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedProducts = [], totalAmount = 0, fromBuyNow = false } = location.state || {};
  
  // Get token from localStorage
  const token = localStorage.getItem('user_token');
  
  // Xử lý giá khác nhau từ Cart và Buy Now
  // Cart: totalAmount đã nhân 1000, Buy Now: totalAmount chưa nhân
  const displayTotalAmount = fromBuyNow ? totalAmount * 1000 : totalAmount;

  const [address, setAddress] = useState<Address>({
    name: "",
    phone: "",
    street: "",
    ward: "",
    district: "",
    province: "",
  });

  // Address API states
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedWardId, setSelectedWardId] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("Thanh toán khi nhận hàng (COD)");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  // Load provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get('/api/addresses/provinces');
        setProvinces(response.data || []);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    fetchProvinces();
  }, []);

  // Handle province change
  const handleProvinceChange = async (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId("");
    setDistricts([]);
    setWards([]);
    setSelectedWardId("");
    
    const selectedProvince = provinces.find(p => p.code.toString() === provinceId);
    setAddress(prev => ({ ...prev, province: selectedProvince?.name || "", district: "", ward: "" }));
    
    if (provinceId) {
      // Use exact code from selected province to avoid mismatches (e.g., '01' vs '1')
      const pid = (selectedProvince?.code ?? provinceId).toString();
      try {
        const response = await axios.get(`/api/addresses/districts/${pid}`);
        const data = response.data || [];
        console.log('Districts fetched from backend:', Array.isArray(data) ? data.length : data);
        setDistricts(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length === 0) {
          console.warn('No districts returned for province code:', pid, selectedProvince);
        }
      } catch (error) {
        console.error('Error fetching districts (backend):', error);
        setDistricts([]);
      }
    }
  };

  // Handle district change
  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrictId(districtId);
    setWards([]);
    setSelectedWardId("");
    
    const selectedDistrict = districts.find(d => d.code.toString() === districtId);
    setAddress(prev => ({ ...prev, district: selectedDistrict?.name || "", ward: "" }));
    
    if (districtId) {
      const did = (selectedDistrict?.code ?? districtId).toString();
      try {
        const response = await axios.get(`/api/addresses/wards/${did}`);
        const data = response.data || [];
        console.log('Wards fetched from backend:', Array.isArray(data) ? data.length : data);
        setWards(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length === 0) {
          console.warn('No wards returned for district code:', did, selectedDistrict);
        }
      } catch (error) {
        console.error('Error fetching wards (backend):', error);
        setWards([]);
      }
    }
  };

  // Handle ward change
  const handleWardChange = (wardId: string) => {
    setSelectedWardId(wardId);
    const selectedWard = wards.find(w => w.code.toString() === wardId);
    setAddress(prev => ({ ...prev, ward: selectedWard?.name || "" }));
  };

  const shippingFee = 30000;
  const finalAmount = displayTotalAmount + shippingFee - discountAmount;

  // Validate voucher
  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) {
      alert("Vui lòng nhập mã voucher");
      return;
    }

    setIsValidatingVoucher(true);
    try {
      const response = await axios.post(
        'http://localhost:8000/api/test-voucher',
        { code: voucherCode, total_amount: totalAmount },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const voucher = (response.data as any)?.voucher;
      const discount = (response.data as any)?.discount_amount || 0;

      if (voucher) {
        setAppliedVoucher(voucher);
        setDiscountAmount(discount);
        alert(`Áp dụng voucher thành công! Giảm ${discount.toLocaleString('vi-VN')} VND`);
      }
    } catch (error: any) {
      console.error('Voucher validation error:', error);
      alert(error.response?.data?.message || 'Mã voucher không hợp lệ');
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  // Remove voucher
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setVoucherCode("");
  };

  // Clear ordered items from cart
  const clearOrderedItems = async () => {
    try {
      for (const product of selectedProducts) {
        await axios.delete(`http://localhost:8000/api/cart/${product.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error("Error clearing cart items:", error);
    }
  };

  // Process order (actual order creation)
  const processOrder = async () => {
    console.log('=== PROCESSING ORDER ===');
    
    const orderRequestData = {
      user_id: parseInt(user.id),
      shipping_address: `${address.street}, ${address.ward}, ${address.district}, ${address.province}`,
      shipping_phone: user.phone || "0123456789",
      shipping_name: user.name || user.username || "Khách hàng",
      note: `Phương thức thanh toán: ${paymentMethod}`,
      items: selectedProducts.map((item) => ({
        variant_id: item.variant_id || 1,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      console.log('STARTING ORDER CREATION...');
      console.log('Order request data:', orderRequestData);
      
      let orderResponse: any;
      let orderId: any;
      
      try {
        console.log('CALLING ORDER API...');
        orderResponse = await axios.post('http://localhost:8000/api/test-order', orderRequestData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Order API SUCCESS:', orderResponse.data);
        orderId = orderResponse.data?.data?.id;
        
        if (!orderId) {
          console.error('Full response:', orderResponse.data);
          throw new Error(`Không nhận được ID đơn hàng`);
        }
      } catch (orderError: any) {
        console.error('ORDER API FAILED:', orderError);
        console.error('Error details:', orderError.response?.data || orderError.message);
        orderId = 'ORD' + Date.now();
        orderResponse = { data: { data: { id: orderId, created_at: new Date().toISOString() } } };
      }
      
      // Create payment (optional)
      let paymentResponse: any = {};
      try {
        if (paymentMethod !== "Thanh toán khi nhận hàng (COD)") {
          paymentResponse = await axios.post('http://localhost:8000/api/payments', {
            order_id: orderId,
            amount: finalAmount,
            method: paymentMethod
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      } catch (paymentError) {
        console.error('Payment creation error:', paymentError);
      }

      // Clear cart items
      console.log('CLEARING CART ITEMS...');
      await clearOrderedItems();
      console.log('CART CLEARED');

      console.log('ORDER SUCCESS - SHOWING ALERT');
      alert("Đặt hàng thành công!");
      
      // Navigate to success page with full data
      console.log('NAVIGATING TO SUCCESS PAGE...');
      const orderData = orderResponse.data?.data;
      console.log('Final order data for navigation:', orderData);
      
      navigate("/order-success", {
        state: {
          orderId: orderId,
          orderData: orderData,
          address,
          totalAmount: finalAmount,
          paymentMethod,
          createdAt: orderData?.created_at || new Date().toISOString(),
          items: selectedProducts,
          customerName: user.name || user.username || "Khách hàng",
          customerPhone: user.phone || "",
          voucherCode: appliedVoucher?.code || null,
          discountAmount: discountAmount,
          paymentStatus: (paymentResponse as any)?.payment?.status || 'pending',
          shippingFee: orderData?.shipping_fee || 30000,
          finalOrderAmount: orderData?.final_amount || finalAmount
        },
      });
    } catch (error: any) {
      console.error("PROCESS ORDER ERROR:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert(error.message || "Xảy ra lỗi, thử lại sau.");
    }
  };

  // Process order với payment record cho tất cả phương thức
  const processOrderWithPayment = async (paymentMethod: string) => {
    try {
      console.log('=== PROCESSING ORDER WITH PAYMENT ===');
      console.log('Payment method:', paymentMethod);
      console.log('Token:', token ? `EXISTS (${token.substring(0, 20)}...)` : 'MISSING');
      console.log('User:', user);
      console.log('LocalStorage user_token:', localStorage.getItem('user_token'));
      console.log('LocalStorage user:', localStorage.getItem('user'));
      
      if (!token) {
        alert("Vui lòng đăng nhập để đặt hàng");
        navigate('/login');
        return;
      }

      if (!user?.id) {
        alert("Không tìm thấy thông tin người dùng");
        return;
      }

      // 0. Test authentication trước
      console.log('TESTING AUTHENTICATION...');
      try {
        const authTest = await axios.get('/api/test-auth', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('AUTH TEST SUCCESS:', authTest.data);
      } catch (authError: any) {
        console.error('AUTH TEST FAILED:', authError);
        console.error('Auth error status:', authError.response?.status);
        console.error('Auth error data:', authError.response?.data);
        
        if (authError.response?.status === 401) {
          alert("Token đã hết hạn. Vui lòng đăng nhập lại.");
          navigate('/login');
          return;
        }
      }

      // 1. Tạo đơn hàng trước (sử dụng test-order để debug)
      console.log('CREATING ORDER...');
      console.log('Request URL:', '/api/test-order');
      
      const orderResponse = await axios.post('/api/test-order', {
        user_id: user?.id,
        products: selectedProducts.map((item: any) => ({
          product_id: item.product_id,
          variant_id: item.variant_id || 1,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: totalAmount,
        shipping_fee: shippingFee,
        final_amount: finalAmount,
        voucher_code: appliedVoucher?.code || null,
        discount_amount: discountAmount,
        customer_name: address.name,
        customer_phone: address.phone,
        customer_email: user?.email || '',
        shipping_address: `${address.street}, ${address.ward}, ${address.district}, ${address.province}`,
        payment_method: paymentMethod,
        notes: ''
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('ORDER RESPONSE:', orderResponse.data);
      const orderId = (orderResponse.data as any)?.data?.id;
      if (!orderId) {
        throw new Error('Không thể tạo đơn hàng - không nhận được ID');
      }

      console.log('ORDER CREATED:', orderId);

      // 2. Tạo payment record cho tất cả phương thức
      console.log('CREATING PAYMENT RECORD...');
      const paymentResponse = await axios.post('/api/payments/create', {
        order_id: orderId,
        method: paymentMethod,
        amount: finalAmount
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('PAYMENT RECORD CREATED:', paymentResponse.data);

      // 3. Clear cart
      await clearOrderedItems();

      // 4. Thông báo thành công
      if (paymentMethod === 'cod') {
        alert("Đặt hàng COD thành công! Bạn sẽ thanh toán khi nhận hàng.");
        navigate('/orders'); // Chuyển đến trang đơn hàng
      } else {
        alert("Đặt hàng thành công! Payment record đã được tạo.");
        // Có thể chuyển đến trang thanh toán hoặc đơn hàng
        navigate('/orders');
      }

    } catch (error: any) {
      console.error('=== PROCESS ORDER WITH PAYMENT ERROR ===');
      console.error('Error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Lỗi khi đặt hàng';
      
      if (error.response?.status === 404) {
        errorMessage = 'API endpoint không tồn tại. Vui lòng kiểm tra server backend.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        navigate('/login');
      } else if (error.response?.status === 422) {
        errorMessage = 'Dữ liệu không hợp lệ: ' + (error.response?.data?.message || 'Vui lòng kiểm tra thông tin');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  // Handle checkout button click
  const handleCheckout = async () => {
    console.log('=== CHECKOUT DEBUG ===');
    console.log('Address:', address);
    console.log('Selected products:', selectedProducts);
    console.log('Payment method:', paymentMethod);
    console.log('User:', user);
    console.log('Token:', token ? 'EXISTS' : 'MISSING');
    
    // Validation
    if (!address.street || !address.ward || !address.district || !address.province) {
      console.log('ADDRESS VALIDATION FAILED');
      alert("Vui lòng điền đầy đủ địa chỉ giao hàng");
      return;
    }

    if (selectedProducts.length === 0) {
      console.log('NO PRODUCTS SELECTED');
      alert("Không có sản phẩm nào được chọn");
      return;
    }
    
    console.log('VALIDATION PASSED');

    // Show QR modal for online payments
    if (paymentMethod === "Chuyển khoản ngân hàng" || paymentMethod === "Ví điện tử (Momo/ZaloPay)") {
      console.log('SHOWING QR MODAL FOR ONLINE PAYMENT');
      setShowQRModal(true);
      return;
    }

    // Process order directly for COD
    console.log('PROCESSING COD ORDER DIRECTLY');
    await processOrderWithPayment('cod');
  };

  // Handle Place Order - xử lý theo phương thức thanh toán được chọn
  const handlePlaceOrder = async () => {
    console.log('=== PLACE ORDER DEBUG ===');
    console.log('Payment method:', paymentMethod);
    console.log('Address:', address);
    console.log('Selected products:', selectedProducts);
    
    // Validation chung
    if (!address.name || !address.phone || !address.street || !address.ward || !address.district || !address.province) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    if (selectedProducts.length === 0) {
      alert("Không có sản phẩm nào được chọn");
      return;
    }

    if (!token) {
      alert("Vui lòng đăng nhập để đặt hàng");
      return;
    }

    // Xử lý theo phương thức thanh toán - TẤT CẢ ĐỀU LƯU VÀO PAYMENTS
    if (paymentMethod === "ZaloPay") {
      await handleZaloPayPayment(); // ZaloPay vẫn giữ logic riêng vì cần redirect
    } else if (paymentMethod === "Chuyển khoản ngân hàng") {
      await processOrderWithPayment('bank');
      setShowQRModal(true); // Hiển thị QR sau khi lưu payment
    } else if (paymentMethod === "Ví điện tử Momo") {
      await processOrderWithPayment('momo');
      setShowQRModal(true); // Hiển thị QR sau khi lưu payment
    } else {
      // COD - lưu vào payments với method 'cod'
      await processOrderWithPayment('cod');
    }
  };

  // Handle ZaloPay payment
interface ZaloPayResponse {
  success: boolean;
  pay_url: string;
  order_token?: string;
  app_trans_id?: string;
  payment_id: number;
  amount: number;
  order_id: number;
}

const handleZaloPayPayment = async (orderId: number) => {
  try {
    const res = await axios.post<ZaloPayResponse>(
      "http://localhost:8000/api/payments/zalopay/create",
      { order_id: orderId }
    );

    if (res.data.success) {
      window.location.href = res.data.pay_url;
    }
  } catch (error) {
    console.error("ZALOPAY PAYMENT ERROR:", error);
  }
};



  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-dark mb-2">
            <i className="fas fa-credit-card text-success me-3"></i>
            Thanh toán đơn hàng
          </h1>
          <p className="text-muted fs-5">Hoàn tất đơn hàng của bạn</p>
        </div>

        <div className="row g-4">
          {/* Thông tin đơn hàng */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-box text-primary me-2"></i>
                  Đơn hàng của bạn ({selectedProducts.length} sản phẩm)
                </h5>
              </div>
              <div className="card-body p-0">
                {selectedProducts.map((item: Product, index: number) => (
                  <div key={item.id} className={`p-4 ${index !== selectedProducts.length - 1 ? 'border-bottom' : ''}`}>
                    <div className="row align-items-center">
                      <div className="col-auto">
                        <img 
                          src={item.image || 'https://via.placeholder.com/80'} 
                          alt={item.name} 
                          className="rounded-3 shadow-sm"
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="col">
                        <h6 className="fw-bold mb-1">{item.name}</h6>
                        <div className="text-muted mb-2">Số lượng: {item.quantity}</div>
                        <div className="fw-bold text-danger">
                          {(item.price * 1000).toLocaleString('vi-VN')} VND
                        </div>
                      </div>
                      <div className="col-auto">
                        <div className="fw-bold fs-5 text-dark">
                          {(item.price * 1000 * item.quantity).toLocaleString('vi-VN')} VND
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Địa chỉ giao hàng */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-map-marker-alt text-danger me-2"></i>
                  Địa chỉ giao hàng
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Họ và tên *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập họ và tên"
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Số điện thoại *</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Nhập số điện thoại"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Tỉnh/Thành phố *</label>
                    <select
                      className="form-select"
                      value={selectedProvinceId}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Quận/Huyện *</label>
                    <select
                      className="form-select"
                      value={selectedDistrictId}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      disabled={!selectedProvinceId}
                    >
                      <option value="">Chọn quận/huyện</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Phường/Xã *</label>
                    <select
                      className="form-select"
                      value={selectedWardId}
                      onChange={(e) => handleWardChange(e.target.value)}
                      disabled={!selectedDistrictId}
                    >
                      <option value="">Chọn phường/xã</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Số nhà, tên đường *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập địa chỉ cụ thể"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-credit-card text-success me-2"></i>
                  Phương thức thanh toán
                </h5>
              </div>
              <div className="card-body">
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="cod"
                    checked={paymentMethod === "Thanh toán khi nhận hàng (COD)"}
                    onChange={() => setPaymentMethod("Thanh toán khi nhận hàng (COD)")}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="cod">
                    <i className="fas fa-hand-holding-usd text-warning me-2"></i>
                    Thanh toán khi nhận hàng (COD)
                  </label>
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="bank"
                    checked={paymentMethod === "Chuyển khoản ngân hàng"}
                    onChange={() => setPaymentMethod("Chuyển khoản ngân hàng")}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="bank">
                    <i className="fas fa-university text-primary me-2"></i>
                    Chuyển khoản ngân hàng
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="momo"
                    checked={paymentMethod === "Ví điện tử Momo"}
                    onChange={() => setPaymentMethod("Ví điện tử Momo")}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="momo">
                    <i className="fas fa-mobile-alt text-info me-2"></i>
                    Ví điện tử Momo
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="zalopay"
                    checked={paymentMethod === "ZaloPay"}
                    onChange={() => setPaymentMethod("ZaloPay")}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="zalopay">
                    <i className="fas fa-qrcode text-success me-2"></i>
                    ZaloPay
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 sticky-top" style={{ top: '20px' }}>
              <div className="card-header bg-primary text-white py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-receipt me-2"></i>
                  Tóm tắt đơn hàng
                </h5>
              </div>
              <div className="card-body">
                {/* Voucher */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Mã giảm giá</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập mã voucher"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      disabled={!!appliedVoucher}
                    />
                    <button
                      className="btn btn-outline-primary"
                      type="button"
                      onClick={handleValidateVoucher}
                      disabled={isValidatingVoucher || !!appliedVoucher}
                    >
                      {isValidatingVoucher ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        "Áp dụng"
                      )}
                    </button>
                  </div>
                  {appliedVoucher && (
                    <div className="mt-2 p-2 bg-success bg-opacity-10 rounded">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-success fw-semibold">
                          <i className="fas fa-check-circle me-1"></i>
                          {appliedVoucher.code}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={handleRemoveVoucher}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chi tiết giá */}
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <span className="fw-semibold">{displayTotalAmount.toLocaleString('vi-VN')} VND</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <span className="fw-semibold">{shippingFee.toLocaleString('vi-VN')} VND</span>
                </div>
                {discountAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Giảm giá:</span>
                    <span className="fw-semibold text-success">-{discountAmount.toLocaleString('vi-VN')} VND</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <span className="fs-5 fw-bold">Tổng cộng:</span>
                  <span className="fs-4 fw-bold text-danger">{finalAmount.toLocaleString('vi-VN')} VND</span>
                </div>

                <button
                  className="btn btn-success w-100 py-3 fw-bold mb-3"
                  onClick={handlePlaceOrder}
                  disabled={selectedProducts.length === 0}
                >
                  <i className="fas fa-shopping-cart me-2"></i>
                  Đặt hàng ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QR Modal */}
        {showQRModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="fas fa-qrcode me-2"></i>
                    Thanh toán {paymentMethod}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowQRModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    {/* QR Code Column */}
                    <div className="col-md-6 text-center">
                      <h6 className="fw-bold mb-3">Quét mã QR để thanh toán</h6>
                      
                      {paymentMethod === "Chuyển khoản ngân hàng" ? (
                        <div>
                          <img
                            src={`https://img.vietqr.io/image/970422-0686809012005-compact2.jpg?amount=${finalAmount}&addInfo=Thanh%20toan%20don%20hang%20${Date.now()}&accountName=LE%20KHAI%20HOAN`}
                            alt="QR Chuyển khoản MB Bank"
                            className="img-fluid border rounded"
                            style={{ maxWidth: '280px' }}
                          />
                          <div className="mt-3">
                            <div className="card bg-light">
                              <div className="card-body p-3">
                                <div className="row text-start">
                                  <div className="col-6"><strong>Ngân hàng:</strong></div>
                                  <div className="col-6">MB Bank</div>
                                  <div className="col-6"><strong>Số TK:</strong></div>
                                  <div className="col-6">0686809012005</div>
                                  <div className="col-6"><strong>Chủ TK:</strong></div>
                                  <div className="col-6">LE KHAI HOAN</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <img
                            src={`https://momosv3.apimienphi.com/api/QRCode?phone=0686809012005&amount=${finalAmount}&note=Thanh%20toan%20don%20hang%20${Date.now()}`}
                            alt="QR Momo"
                            className="img-fluid border rounded"
                            style={{ maxWidth: '280px' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/280x280/28a745/ffffff?text=MOMO+QR';
                            }}
                          />
                          <div className="mt-3">
                            <div className="card bg-light">
                              <div className="card-body p-3">
                                <div className="row text-start">
                                  <div className="col-6"><strong>Ví Momo:</strong></div>
                                  <div className="col-6">0686809012005</div>
                                  <div className="col-6"><strong>Tên:</strong></div>
                                  <div className="col-6">LE KHAI HOAN</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Payment Info Column */}
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-3">Thông tin thanh toán</h6>
                      
                      <div className="card border-primary">
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Tạm tính:</span>
                            <span className="fw-semibold">{totalAmount.toLocaleString('vi-VN')} VND</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Phí vận chuyển:</span>
                            <span className="fw-semibold">{shippingFee.toLocaleString('vi-VN')} VND</span>
                          </div>
                          {discountAmount > 0 && (
                            <div className="d-flex justify-content-between mb-2">
                              <span>Giảm giá:</span>
                              <span className="fw-semibold text-success">-{discountAmount.toLocaleString('vi-VN')} VND</span>
                            </div>
                          )}
                          <hr />
                          <div className="d-flex justify-content-between mb-3">
                            <span className="fs-5 fw-bold">Tổng thanh toán:</span>
                            <span className="fs-4 fw-bold text-danger">{finalAmount.toLocaleString('vi-VN')} VND</span>
                          </div>
                          
                          <div className="alert alert-info">
                            <i className="fas fa-info-circle me-2"></i>
                            <strong>Nội dung chuyển khoản:</strong><br/>
                            Thanh toan don hang {Date.now()}
                          </div>
                          
                          <div className="alert alert-warning">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            Vui lòng chuyển khoản <strong>chính xác số tiền</strong> và <strong>nội dung</strong> để đơn hàng được xử lý tự động.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowQRModal(false)}
                  >
                    <i className="fas fa-times me-2"></i>
                    Hủy
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      console.log('QR PAYMENT CONFIRMED - PROCESSING ORDER');
                      setShowQRModal(false);
                      processOrder();
                    }}
                  >
                    <i className="fas fa-check me-2"></i>
                    Đã thanh toán - Hoàn tất đơn hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
