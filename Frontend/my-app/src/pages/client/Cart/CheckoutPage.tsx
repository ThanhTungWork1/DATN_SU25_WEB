import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import publicAxios from "../../../utils/publicAxios";
import { useAuth } from "../../../provider/AuthContext";
// Load administrative divisions from backend endpoints to always get up-to-date (merged) data

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
  
  // Tất cả giá trị đều là VND, không nhân thêm
  const displayTotalAmount = totalAmount;

  const [address, setAddress] = useState<Address>({
    name: "",
    phone: "",
    street: "",
    ward: "",
    district: "",
    province: "",
  });

  // Address lists (fetched from backend AddressController)
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
  // VNPay modal + URL state
  const [showVNPayModal, setShowVNPayModal] = useState(false);
  const [vnpayUrl, setVnpayUrl] = useState<string>("");
  
  // Chuẩn hóa mã phương thức thanh toán theo BE
  const toMethodCode = (label: string) => {
    switch (label) {
      case 'Thanh toán khi nhận hàng (COD)':
        return 'cod';
      case 'Chuyển khoản ngân hàng':
        return 'bank';
      case 'VNPay':
        return 'vnpay';
      default:
        return 'cod';
    }
  };

  // Validate items + address before submit (cho phép thiếu variant_id nếu có product_id để auto-resolve)
  const validateOrderPayloadFE = () => {
    if (!address.name?.trim()) return { ok: false, msg: 'Vui lòng nhập họ và tên người nhận' } as const;
    if (!address.phone?.trim()) return { ok: false, msg: 'Vui lòng nhập số điện thoại' } as const;
    if (!address.street?.trim() || !address.ward || !address.district || !address.province) {
      return { ok: false, msg: 'Vui lòng điền đầy đủ địa chỉ giao hàng' } as const;
    }
    if (!Array.isArray(selectedProducts) || selectedProducts.length === 0) {
      return { ok: false, msg: 'Giỏ hàng trống' } as const;
    }
    for (const it of selectedProducts) {
      // Cho phép thiếu variant_id nếu có product_id, sẽ auto-resolve ở bước tạo đơn
      if ((!it?.variant_id || Number.isNaN(Number(it.variant_id))) && !it?.product_id) {
        return { ok: false, msg: 'Thiếu variant_id và product_id cho một số sản phẩm' } as const;
      }
      if (!it?.quantity || it.quantity <= 0) {
        return { ok: false, msg: 'Số lượng sản phẩm không hợp lệ' } as const;
      }
      if (it?.price == null || Number(it.price) < 0) {
        return { ok: false, msg: 'Giá sản phẩm không hợp lệ' } as const;
      }
    }
    return { ok: true } as const;
  };

  // Lấy danh sách biến thể theo product_id và chọn 1 biến thể mặc định khi thiếu
  const resolveItemsWithVariantIds = async () => {
    // Bổ sung product_name, product_id, product_image để khớp schema BE (order_items yêu cầu product_name)
    const items: Array<{
      variant_id: number;
      quantity: number;
      price: number;
      product_name?: string;
      product_id?: number;
      product_image?: string | null;
    } | null> = [];
    for (const it of selectedProducts) {
      if (it?.variant_id) {
        const pid = (it as any).product_id ?? (it as any).id;
        // Validate tồn kho của biến thể hiện có
        try {
          if (pid) {
            const resVar = await publicAxios.get(`/product-variants/${pid}`);
            const payloadVar: any = resVar.data;
            const listVar = Array.isArray(payloadVar)
              ? payloadVar
              : Array.isArray(payloadVar?.data)
              ? payloadVar.data
              : Array.isArray(payloadVar?.variants)
              ? payloadVar.variants
              : [];
            if (Array.isArray(listVar) && listVar.length > 0) {
              const found = listVar.find((v: any) => Number(v?.id) === Number(it.variant_id));
              const stock = Number(found?.stock ?? Infinity);
              if (Number(it.quantity) > stock) {
                alert(`Sản phẩm "${it.name}" không đủ tồn kho cho biến thể đã chọn. Còn lại: ${isFinite(stock) ? stock : 0}`);
                return null;
              }
            }
          }
        } catch (e) {
          console.warn('Không thể kiểm tra tồn kho biến thể hiện có:', e);
        }

        items.push({
          variant_id: Number(it.variant_id),
          quantity: Number(it.quantity),
          price: Number(it.price),
          product_name: it.name || 'Sản phẩm',
          product_id: pid ? Number(pid) : undefined,
          product_image: it.image || null,
        });
        continue;
      }
      if (!it?.product_id) {
        alert('Sản phẩm thiếu product_id để gán biến thể mặc định');
        return null;
      }
      try {
        const res = await publicAxios.get(`/product-variants/${it.product_id}`);
        const payload: any = res.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.variants)
          ? payload.variants
          : [];
        if (!Array.isArray(list) || list.length === 0) {
          alert(`Sản phẩm ${it.product_id} không có biến thể. Vui lòng tạo biến thể mặc định hoặc chọn biến thể.`);
          return null;
        }
        const candidate = list.find((v: any) => (v?.stock ?? 0) > 0) || list[0];
        if (!candidate?.id) {
          alert(`Không thể xác định biến thể mặc định cho sản phẩm ${it.product_id}`);
          return null;
        }
        const pid = (it as any).product_id ?? (it as any).id ?? (candidate as any)?.product_id;
        const candidateStock = Number((candidate as any)?.stock ?? Infinity);
        if (Number(it.quantity) > candidateStock) {
          alert(`Sản phẩm "${it.name || candidate?.product_name || it.product_id}" không đủ tồn kho. Còn lại: ${isFinite(candidateStock) ? candidateStock : 0}`);
          return null;
        }
        items.push({
          variant_id: Number(candidate.id),
          quantity: Number(it.quantity),
          price: Number(it.price),
          product_name: it.name || (candidate as any)?.product_name || 'Sản phẩm',
          product_id: pid ? Number(pid) : undefined,
          product_image: it.image || null,
        });
      } catch (e: any) {
        console.error('Resolve variant error:', e?.response?.data || e?.message || e);
        alert(`Không thể lấy biến thể cho sản phẩm ${it.product_id}`);
        return null;
      }
    }
    return items as Array<{
      variant_id: number;
      quantity: number;
      price: number;
      product_name?: string;
      product_id?: number;
      product_image?: string | null;
    }>;
  };

  // Load provinces from backend on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await publicAxios.get('/addresses/provinces');
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setProvinces(list);
      } catch (error) {
        console.error('Error loading provinces:', error);
      }
    })();
  }, []);

  // Handle province change: fetch districts from backend
  const handleProvinceChange = async (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId("");
    setDistricts([]);
    setWards([]);
    setSelectedWardId("");

    const selectedProvince = provinces.find(p => String(p.code) === String(provinceId));
    setAddress(prev => ({ ...prev, province: selectedProvince?.name || "", district: "", ward: "" }));

    if (!provinceId) return;
    try {
      const res = await publicAxios.get(`/addresses/districts/${encodeURIComponent(provinceId)}`);
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setDistricts(list);
      if (!Array.isArray(list) || list.length === 0) {
        console.warn('No districts returned for province:', provinceId);
      }
    } catch (e) {
      console.error('Error loading districts:', e);
    }
  };

  // Handle VNPay payment
  const handleVNPayPayment = async () => {
    try {
      if (!token) {
        alert("Vui lòng đăng nhập để thanh toán");
        navigate('/login');
        return;
      }

      // FE validate địa chỉ + cấu trúc cơ bản
      const vAddr = validateAddress();
      if (!(vAddr as any).ok) {
        alert((vAddr as any).msg || 'Thông tin giao hàng chưa hợp lệ');
        return;
      }
      // Resolve items có variant_id
      const items = await resolveItemsWithVariantIds();
      if (!items) return;
      // 1) Tạo đơn hàng (payload khớp BE: items + shipping + payment_method)
      const orderRes = await publicAxios.post('/client/orders', {
        shipping_address: `${address.street}, ${address.ward}, ${address.district}, ${address.province}`,
        shipping_phone: address.phone,
        shipping_name: address.name || (user?.name || user?.username) || 'Khách hàng',
        note: 'Thanh toán VNPay',
        payment_method: 'vnpay',
        discount_amount: discountAmount || 0,
        total_amount: Number(displayTotalAmount),
        shipping_fee: Number(shippingFee),
        final_amount: Number(finalAmount),
        customer_name: address.name || (user?.name || user?.username) || 'Khách hàng',
        customer_email: user?.email || null,
        customer_phone: address.phone,
        items,
      });

      const orderId = (orderRes.data as any)?.data?.id;
      if (!orderId) throw new Error('Không thể tạo đơn hàng');

      // 2) Gọi VNPay create để lấy payment_url (BE sẽ tự tạo payment record pending)
      const createRes = await publicAxios.post('/payments/vnpay/create', { order_id: orderId });

      const paymentUrl = (createRes.data as any)?.payment_url;
      if (!paymentUrl) throw new Error('Không nhận được payment_url từ VNPay');

      // 3) Xóa các item đã đặt khỏi giỏ hàng (optional trước khi hiển thị QR)
      await clearOrderedItems();

      // 4) Hiển thị QR VNPay tại chỗ thay vì redirect
      setVnpayUrl(paymentUrl);
      setShowVNPayModal(true);

    } catch (e: any) {
      console.error('VNPAY FLOW ERROR:', e?.response?.data || e?.message || e);
      alert(e?.response?.data?.error || e?.message || 'Có lỗi xảy ra khi tạo thanh toán VNPay');
    }
  };

  // Handle district change: fetch wards from backend
  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrictId(districtId);
    setWards([]);
    setSelectedWardId("");

    const selectedDistrict = districts.find(d => String(d.code) === String(districtId));
    setAddress(prev => ({ ...prev, district: selectedDistrict?.name || "", ward: "" }));

    if (!districtId) return;
    try {
      const res = await publicAxios.get(`/addresses/wards/${encodeURIComponent(districtId)}`);
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setWards(list);
      if (!Array.isArray(list) || list.length === 0) {
        console.warn('No wards returned for district:', districtId);
      }
    } catch (e) {
      console.error('Error loading wards:', e);
    }
  };

  // Validate shipping address thoroughly
  const isValidPhone = (phone: string) => /^\d{9,11}$/.test((phone || '').replace(/\D/g, ''));
  const validateAddress = () => {
    if (!address.name?.trim()) return { ok: false, msg: 'Vui lòng nhập họ và tên' };
    if (!address.phone?.trim() || !isValidPhone(address.phone)) return { ok: false, msg: 'Số điện thoại không hợp lệ' };
    if (!selectedProvinceId || !address.province) return { ok: false, msg: 'Vui lòng chọn Tỉnh/Thành phố' };
    if (!selectedDistrictId || !address.district) return { ok: false, msg: 'Vui lòng chọn Quận/Huyện' };
    if (!selectedWardId || !address.ward) return { ok: false, msg: 'Vui lòng chọn Phường/Xã' };
    if (!address.street?.trim()) return { ok: false, msg: 'Vui lòng nhập Số nhà, tên đường' };
    return { ok: true } as any;
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
      const response = await publicAxios.get(
        '/vouchers/' + encodeURIComponent(voucherCode)
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
        await publicAxios.delete(`/cart/${product.id}`);
      }
    } catch (error) {
      console.error("Error clearing cart items:", error);
    }
  };

  // Process order (actual order creation)
  const processOrder = async () => {
    console.log('=== PROCESSING ORDER ===');
    
    // Validate địa chỉ
    const v0 = validateAddress();
    if (!(v0 as any).ok) { alert((v0 as any).msg || 'Thông tin giao hàng chưa hợp lệ'); return; }
    // Resolve items
    const items0 = await resolveItemsWithVariantIds();
    if (!items0) return;
    const orderRequestData = {
      shipping_address: `${address.street}, ${address.ward}, ${address.district}, ${address.province}`,
      shipping_phone: address.phone || user.phone || "0123456789",
      shipping_name: address.name || user.name || user.username || "Khách hàng",
      note: `Phương thức thanh toán: ${paymentMethod}`,
      payment_method: toMethodCode(paymentMethod),
      discount_amount: discountAmount || 0,
      items: items0,
    } as const;

    try {
      console.log('STARTING ORDER CREATION...');
      console.log('Order request data:', orderRequestData);
      
      let orderResponse: any;
      let orderId: any;
      
      try {
        console.log('CALLING ORDER API...');
        orderResponse = await publicAxios.post('/client/orders', orderRequestData);
        
        console.log('Order API SUCCESS:', orderResponse.data);
        orderId = orderResponse.data?.data?.id;
        
        if (!orderId) {
          console.error('Full response:', orderResponse.data);
          throw new Error(`Không nhận được ID đơn hàng`);
        }
      } catch (orderError: any) {
        console.error('ORDER API FAILED:', orderError);
        console.error('Error details:', orderError.response?.data || orderError.message);
        alert(orderError?.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại hoặc chọn phương thức khác.');
        return; // Dừng luồng nếu tạo đơn thất bại
      }
      
      // Create payment (removed) - BE will handle payment record creation in dedicated gateways
      let paymentResponse: any = {};

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
        // Gọi một endpoint yêu cầu auth để xác thực token
        const authTest = await publicAxios.get('/dashboard');
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

      // 1. Tạo đơn hàng trước
      console.log('CREATING ORDER...');
      console.log('Request URL:', '/client/orders');
      
      // Validate địa chỉ + resolve items
      const v1 = validateAddress();
      if (!(v1 as any).ok) { alert((v1 as any).msg || 'Thông tin giao hàng chưa hợp lệ'); return; }
      const items1 = await resolveItemsWithVariantIds();
      if (!items1) return;
      const orderResponse = await publicAxios.post('/client/orders', {
        shipping_address: `${address.street}, ${address.ward}, ${address.district}, ${address.province}`,
        shipping_phone: address.phone || user?.phone || '0123456789',
        shipping_name: address.name || user?.name || user?.username || 'Khách hàng',
        note: `Thanh toán: ${paymentMethod}`,
        payment_method: toMethodCode(paymentMethod),
        discount_amount: discountAmount || 0,
        items: items1,
      });

      console.log('ORDER RESPONSE:', orderResponse.data);
      const orderId = (orderResponse.data as any)?.data?.id;
      if (!orderId) {
        throw new Error('Không thể tạo đơn hàng - không nhận được ID');
      }

      console.log('ORDER CREATED:', orderId);

      // 2. Tạo payment record cho các phương thức không có cổng thanh toán riêng (COD/Bank)
      let paymentResponse: any = {};
      const methodCode = toMethodCode(paymentMethod);
      if (methodCode === 'cod' || methodCode === 'bank') {
        try {
          // Ưu tiên dùng final_amount từ orderResponse nếu có, fallback tính tại FE
          const orderData = (orderResponse.data as any)?.data || {};
          const amount = Number(orderData.final_amount ?? (Number(displayTotalAmount) + Number(shippingFee) - Number(discountAmount)));
          console.log('CREATING PAYMENT RECORD...', { orderId, method: paymentMethod, amount });
          const pr = await publicAxios.post('/payments/create', {
            order_id: orderId,
            method: methodCode, // 'cod' | 'bank'
            amount,
          });
          paymentResponse = pr.data;
          console.log('PAYMENT RECORD CREATED:', paymentResponse);
        } catch (pe: any) {
          console.error('CREATE PAYMENT RECORD FAILED:', pe?.response?.data || pe?.message || pe);
          alert(pe?.response?.data?.message || 'Không thể tạo payment record');
          return; // Dừng luồng nếu không tạo được payment record
        }
      } else {
        // Với VNPay: đã có endpoint riêng tạo payment record và trả về payment_url
        console.log('Gateway payment method detected, skip unified createPayment');
      }

      // 3. Clear cart
      await clearOrderedItems();

      // 4. Thông báo thành công
      if (paymentMethod === 'cod') {
        alert("Đặt hàng COD thành công! Bạn sẽ thanh toán khi nhận hàng.");
        // Điều hướng sang trang OrderSuccess với dữ liệu đơn hàng
        navigate('/order-success', {
          state: {
            orderId,
            customerName: address.name || user?.name || user?.username || 'Khách hàng',
            customerPhone: address.phone || user?.phone || '',
            address: {
              street: address.street,
              ward: address.ward,
              district: address.district,
              province: address.province,
            },
            paymentMethod: 'Thanh toán khi nhận hàng (COD)',
            paymentStatus: (paymentResponse as any)?.payment?.status || 'pending',
            voucherCode: appliedVoucher?.code || null,
            items: selectedProducts.map((it: any) => ({
              name: it.name,
              quantity: it.quantity,
              price: Number(it.price),
              image: it.image || null,
            })),
            // Tổng tiền
            totalAmount: Number(displayTotalAmount) + Number(shippingFee),
            discountAmount: Number(discountAmount) || 0,
            shippingFee: Number(shippingFee),
            finalOrderAmount: Number(finalAmount),
            createdAt: new Date().toISOString(),
          },
        });
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

  

  // Handle Place Order - xử lý theo phương thức thanh toán được chọn
  const handlePlaceOrder = async () => {
    console.log('=== PLACE ORDER DEBUG ===');
    console.log('Payment method:', paymentMethod);
    console.log('Address:', address);
    console.log('Selected products:', selectedProducts);
    
    // Validation địa chỉ chi tiết
    const v = validateAddress();
    if (!(v as any).ok) {
      alert((v as any).msg || 'Thông tin giao hàng chưa hợp lệ');
      return;
    }

    if (selectedProducts.length === 0) {
      alert("Không có sản phẩm nào được chọn");
      return;
    }

    if (!token) {
      alert("Vui lòng đăng nhập để đặt hàng");
      navigate('/login');
      return;
    }

    // Xử lý theo phương thức thanh toán - TẤT CẢ ĐỀU LƯU VÀO PAYMENTS
    if (paymentMethod === "VNPay") {
      await handleVNPayPayment();
    } else if (paymentMethod === "Chuyển khoản ngân hàng") {
      await processOrderWithPayment('bank');
      setShowQRModal(true); // Hiển thị QR sau khi lưu payment
    } else {
      // COD - lưu vào payments với method 'cod'
      await processOrderWithPayment('cod');
    }
  };

  // Handle ZaloPay payment
  // Removed duplicate VNPay handler (keep single definition above)

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
                          {item.price.toLocaleString('vi-VN')} VND
                        </div>
                      </div>
                      <div className="col-auto">
                        <div className="fw-bold fs-5 text-dark">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} VND
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
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="vnpay"
                    checked={paymentMethod === "VNPay"}
                    onChange={() => setPaymentMethod("VNPay")}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="vnpay">
                    <i className="fas fa-building-columns text-danger me-2"></i>
                    VNPay
                  </label>
                </div>
                {/* Đã loại bỏ Momo và ZaloPay theo yêu cầu */}
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

        {/* VNPay QR Modal */}
        {showVNPayModal && vnpayUrl && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">
                    <i className="fas fa-qrcode me-2"></i>
                    Thanh toán VNPay
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowVNPayModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 text-center">
                      <h6 className="fw-bold mb-3">Quét mã QR VNPay</h6>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(vnpayUrl)}`}
                        alt="VNPay QR"
                        className="img-fluid border rounded"
                        style={{ maxWidth: '280px' }}
                      />
                      <div className="mt-3">
                        <a
                          href={vnpayUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-danger"
                        >
                          Mở trang VNPay
                        </a>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-3">Thông tin thanh toán</h6>
                      <div className="card border-danger">
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Tổng thanh toán:</span>
                            <span className="fw-bold text-danger">{finalAmount.toLocaleString('vi-VN')} VND</span>
                          </div>
                          <div className="alert alert-info mb-0">
                            Sau khi quét mã và thanh toán, hệ thống sẽ cập nhật trạng thái đơn hàng tự động qua VNPay callback. Bạn có thể mở trang VNPay nếu ứng dụng không hỗ trợ quét.
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
                    onClick={() => setShowVNPayModal(false)}
                  >
                    Đóng
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      window.open(vnpayUrl, '_blank');
                    }}
                  >
                    Thanh toán trên VNPay
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
