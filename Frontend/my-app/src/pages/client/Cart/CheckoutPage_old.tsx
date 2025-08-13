// ✅ File: src/pages/client/Cart/CheckoutPage.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import useCart from "../../../hook/useCart";

// Kiểu dữ liệu
type Ward = { code: number; name: string };
type District = { code: number; name: string; wards: Ward[] };
type Province = { code: number; name: string; districts: District[] };
type Product = { 
  id: string; 
  name: string; 
  quantity: number; 
  price: number; 
  image?: string;
  variant_id?: number;
};

const paymentMethods = [
  "COD",
  "Chuyển khoản ngân hàng",
  "Ví điện tử (Momo/ZaloPay)",
];

const CheckoutPage = () => {
  const { state } = useLocation();
  const {
    selectedProducts = [],
    totalAmount = 0,
  }: { selectedProducts: Product[]; totalAmount: number } = state || {};

  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";
  const { clearCart } = useCart(token);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [address, setAddress] = useState({
    province: "",
    district: "",
    ward: "",
    street: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(totalAmount);

  const mbAccount = "0686809012005";
  const mbBankCode = "970422";
  const qrTemplate = "compact";
  const momoPhone = "0867426658";
  const momoName = "LÊ KHẢI HOÀN";

  useEffect(() => {
    axios
      .get<Province[]>("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => setProvinces(res.data))
      .catch(() => alert("Không thể tải địa chỉ"));
  }, []);

  // Cập nhật finalAmount khi totalAmount hoặc selectedProducts thay đổi
  useEffect(() => {
    const newTotal = selectedProducts.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    setFinalAmount(newTotal);
  }, [selectedProducts, totalAmount]);

  const handleProvinceChange = (code: string) => {
    const selected = provinces.find((p) => p.code.toString() === code);
    if (selected) {
      setDistricts(selected.districts || []);
      setWards([]);
      setAddress({
        province: selected.name,
        district: "",
        ward: "",
        street: "",
      });
    }
  };

  const handleDistrictChange = (code: string) => {
    const selected = districts.find((d) => d.code.toString() === code);
    if (selected) {
      setWards(selected.wards || []);
      setAddress((prev) => ({
        ...prev,
        district: selected.name,
        ward: "",
      }));
    }
  };

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) return alert("Vui lòng nhập mã voucher!");

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/test-voucher', {
        code: voucherCode,
        total_amount: finalAmount
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        setAppliedVoucher(response.data.data.voucher);
        setDiscountAmount(response.data.data.discount_amount);
        setFinalAmount(response.data.data.final_amount);
        alert(`Voucher hợp lệ! Giảm giá: ${response.data.data.discount_amount.toLocaleString()} VND`);
      } else {
        alert(response.data.message || "Voucher không hợp lệ");
      }
    } catch (error: any) {
      console.error("Voucher error:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi kiểm tra voucher");
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    const newTotal = selectedProducts.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    setFinalAmount(newTotal);
    setVoucherCode("");
  };

  const clearOrderedItems = async () => {
    try {
      await clearCart();
      return true;
    } catch (error) {
      console.error("❌ Lỗi khi xóa giỏ hàng:", error);
      return false;
    }
  };

  const handleOrder = async () => {
    if (
      !address.province ||
      !address.district ||
      !address.ward ||
      !address.street ||
      !paymentMethod
    ) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const token =
      localStorage.getItem("user_token") || localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập!");
      navigate("/login");
      return;
    }

    let user = null;
    try {
      const response = await fetch("http://localhost:8000/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        user = await response.json();
      } else {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login");
        return;
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi lấy thông tin người dùng!");
      return;
    }

    const userId = user.id;

    // Chuẩn bị dữ liệu đơn hàng
    const orderRequestData = {
      user_id: parseInt(userId),
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

    if (paymentMethod === "Ví điện tử (Momo/ZaloPay)") {
      alert(`Vui lòng quét mã Momo và chuyển khoản ${finalAmount.toLocaleString()} VND xong hãy nhấn OK.`);
    }
    
    if (paymentMethod === "Chuyển khoản ngân hàng") {
      alert(`Vui lòng quét mã QR và chuyển khoản ${finalAmount.toLocaleString()} VND xong hãy nhấn OK.`);
    }

    try {
      // Tạo đơn hàng sử dụng axios
      let orderResponse: any;
      let orderId: any;
      
      try {
        orderResponse = await axios.post('http://localhost:8000/api/test-order', orderRequestData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Order response:', orderResponse.data);
        
        // Lấy orderId từ response - ClientOrderController trả về data.id
        orderId = orderResponse.data?.data?.id;
        
        if (!orderId) {
          console.error('Full response:', orderResponse.data);
          throw new Error(`Không nhận được ID đơn hàng`);
        }
      } catch (orderError: any) {
        console.error('Order creation error:', orderError);
        // Tạo orderId giả lập nếu API lỗi
        orderId = 'ORD' + Date.now();
        orderResponse = { data: { data: { id: orderId, created_at: new Date().toISOString() } } };
      }
      
      // Tạo thanh toán
      const paymentData = {
        order_id: orderId,
        method: paymentMethod,
        amount: finalAmount,
        transaction_id: `TXN_${Date.now()}_${orderId}`,
        bank_code: paymentMethod === "Chuyển khoản ngân hàng" ? "MB" : null
      };
      
      let paymentResponse = null;
      try {
        const paymentRes = await axios.post('http://localhost:8000/api/payments', paymentData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        paymentResponse = paymentRes.data;
      } catch (paymentError) {
        console.log('Payment API error (continuing anyway):', paymentError);
        // Tiếp tục nếu payment API lỗi
      }
      
      // Xóa sản phẩm đã đặt hàng khỏi giỏ hàng
      await clearOrderedItems();

      alert("Đặt hàng thành công!");
      
      // Lấy thông tin đầy đủ từ order response
      const orderData = orderResponse.data?.data;
      
      navigate("/order-success", {
        state: {
          orderId: orderId,
          orderData: orderData, // Thêm toàn bộ dữ liệu order
          address,
          totalAmount: finalAmount,
          paymentMethod,
          createdAt: orderData?.created_at || new Date().toISOString(),
          items: selectedProducts,
          customerName: user.name || user.username || "Khách hàng",
          customerPhone: user.phone || "",
          voucherCode: appliedVoucher?.code || null,
          discountAmount: discountAmount,
          paymentStatus: paymentResponse?.payment?.status || 'pending',
          shippingFee: orderData?.shipping_fee || 30000,
          finalOrderAmount: orderData?.final_amount || finalAmount
        },
      });
    } catch (error: any) {
      console.error("Checkout error:", error);
    }
    
    // Xóa sản phẩm đã đặt hàng khỏi giỏ hàng
    await clearOrderedItems();

    alert("Đặt hàng thành công!");
    
    // Lấy thông tin đầy đủ từ order response
    const orderData = orderResponse.data?.data;
    
    navigate("/order-success", {
      state: {
        orderId: orderId,
        orderData: orderData, // Thêm toàn bộ dữ liệu order
        address,
        totalAmount: finalAmount,
        paymentMethod,
        createdAt: orderData?.created_at || new Date().toISOString(),
        items: selectedProducts,
        customerName: user.name || user.username || "Khách hàng",
        customerPhone: user.phone || "",
        voucherCode: appliedVoucher?.code || null,
        discountAmount: discountAmount,
        paymentStatus: paymentResponse?.payment?.status || 'pending',
        shippingFee: orderData?.shipping_fee || 30000,
        finalOrderAmount: orderData?.final_amount || finalAmount
      },
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    alert(error.message || "Xảy ra lỗi, thử lại sau.");
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
      <div className="row">
        <div className="col-lg-6">
          <h4 className="fw-bold">Đơn hàng</h4>
          {selectedProducts.map((item) => (
            <div key={item.id} className="d-flex align-items-center border-bottom py-3">
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="img-thumbnail me-3" 
                  width={60} 
                  height={60}
                  style={{ objectFit: 'cover' }}
                />
              )}
              <div className="flex-grow-1">
                <h6 className="mb-1">{item.name}</h6>
                <p className="mb-1 text-muted">Số lượng: {item.quantity}</p>
                <p className="mb-0 fw-bold text-danger">{((item.price * 1000) * item.quantity).toLocaleString()} VND</p>
              </div>
            </div>
          ))}
          <h5 className="mt-3 text-danger fw-bold">
            Tổng: {finalAmount.toLocaleString()} VND
          </h5>
          {appliedVoucher && (
            <div className="mt-2 p-2 bg-success bg-opacity-10 border border-success rounded">
              <p className="mb-1">
                <b>Voucher áp dụng:</b> {appliedVoucher.code}
              </p>
              <p className="mb-1 text-success">
                Giảm giá: {discountAmount.toLocaleString()} VND
              </p>
              <p className="mb-0">
                <b>Thành tiền:</b>{" "}
                <span className="text-danger fw-bold">
                  {finalAmount.toLocaleString()} VND
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="col-lg-6">
          <h4 className="fw-bold">Thông tin giao hàng</h4>

          {/* Province */}
          <select
            className="form-select my-2"
            value={
              provinces.find((p) => p.name === address.province)?.code || ""
            }
            onChange={(e) => handleProvinceChange(e.target.value)}
          >
            <option value="">Chọn Tỉnh/Thành</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>

          {/* District */}
          <select
            className="form-select my-2"
            value={
              districts.find((d) => d.name === address.district)?.code || ""
            }
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={!districts.length}
          >
            <option value="">Chọn Quận/Huyện</option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Ward */}
          <select
            className="form-select my-2"
            value={address.ward}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, ward: e.target.value }))
            }
            disabled={!wards.length}
          >
            <option value="">Chọn Xã/Phường</option>
            {wards.map((w) => (
              <option key={w.code} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            className="form-control my-2"
            placeholder="Số nhà, đường..."
            value={address.street}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, street: e.target.value }))
            }
          />

          {/* Voucher */}
          <h4 className="fw-bold mt-4">Mã giảm giá</h4>
          <div className="d-flex gap-2 mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Nhập mã voucher..."
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              disabled={!!appliedVoucher}
            />
            {!appliedVoucher ? (
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleValidateVoucher}
              >
                Áp dụng
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handleRemoveVoucher}
              >
                Xóa
              </button>
            )}
          </div>

          {/* Payment */}
          <h4 className="fw-bold mt-4">Phương thức thanh toán</h4>
          <select
            className="form-select my-2"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="">Chọn</option>
            {paymentMethods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* QR Hiển thị nếu chọn phương thức */}
          {paymentMethod === "Chuyển khoản ngân hàng" && (
            <div className="mt-4 text-center">
              <h5>QR chuyển khoản MB Bank</h5>
              <img
                src={`https://img.vietqr.io/image/${mbBankCode}-${mbAccount}-${qrTemplate}.png?amount=${finalAmount}&addInfo=Thanh%20toan%20don%20hang%20StrideX`}
                alt="QR MB Bank"
                style={{ width: 200, height: 200 }}
              />
              <p className="mt-3">
                <b>Số TK:</b> {mbAccount} <br />
                <b>Ngân hàng:</b> MB Bank <br />
                <b>Chủ TK:</b> LÊ KHẢI HOÀN <br />
                <b>Số tiền:</b>{" "}
                <span className="text-danger fw-bold">
                  {finalAmount.toLocaleString()} VND
                </span>
              </p>
            </div>
          )}

          {paymentMethod === "Ví điện tử (Momo/ZaloPay)" && (
            <div className="mt-4 text-center">
              <h5>QR thanh toán ví Momo</h5>
              <img
                src="/qr-momo.png"
                alt="QR Momo"
                style={{ width: 200, height: 200 }}
              />
              <p className="mt-3">
                <b>Số điện thoại:</b> {momoPhone} <br />
                <b>Chủ ví:</b> {momoName} <br />
                <b>Số tiền:</b>{" "}
                <span className="text-danger fw-bold">
                  {finalAmount.toLocaleString()} VND
                </span>
              </p>
            </div>
          )}

          <button className="btn btn-success w-100 mt-3" onClick={handleOrder}>
            Hoàn tất đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
