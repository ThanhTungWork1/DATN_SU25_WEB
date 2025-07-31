// ✅ File: src/pages/client/Cart/CheckoutPage.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// Kiểu dữ liệu

type Ward = { code: number; name: string };
type District = { code: number; name: string; wards: Ward[] };
type Province = { code: number; name: string; districts: District[] };
type Product = { id: string; name: string; quantity: number; price: number };

const paymentMethods = [
  "COD",
  "Chuyển khoản ngân hàng",
  "Ví điện tử (Momo/ZaloPay)",
];

const CheckoutPage = () => {
  const { state } = useLocation();
  const { selectedProducts = [], totalAmount = 0 }: {
    selectedProducts: Product[];
    totalAmount: number;
  } = state || {};

  const navigate = useNavigate();

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
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);

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

  useEffect(() => {
    // Load danh sách voucher có sẵn
    fetch('http://localhost:8000/api/vouchers/available/list')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setAvailableVouchers(data.data);
        }
      })
      .catch(error => {
        console.error('Error loading vouchers:', error);
      });
  }, []);

  const handleProvinceChange = (code: string) => {
    const selected = provinces.find((p) => p.code.toString() === code);
    setDistricts(selected?.districts || []);
    setWards([]);
    setAddress({
      province: selected?.name || "",
      district: "",
      ward: "",
      street: "",
    });
  };

  const handleDistrictChange = (code: string) => {
    const selected = districts.find((d) => d.code.toString() === code);
    setWards(selected?.wards || []);
    setAddress((prev) => ({
      ...prev,
      district: selected?.name || "",
      ward: "",
    }));
  };

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) {
      alert("Vui lòng nhập mã voucher!");
      return;
    }

    try {
      const currentTotal = selectedProducts.reduce((total, item) => total + ((item.price * 1000) * item.quantity), 0);
      
      const response = await fetch(`http://localhost:8000/api/vouchers/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: voucherCode,
          total_amount: currentTotal
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setAppliedVoucher(data.data.voucher);
        setDiscountAmount(data.data.discount_amount);
        setFinalAmount(data.data.final_amount);
        alert(`Voucher hợp lệ! Giảm giá: ${data.data.discount_amount.toLocaleString()} VND`);
      } else {
        alert(data.message || 'Voucher không hợp lệ');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi kiểm tra voucher');
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setFinalAmount(selectedProducts.reduce((total, item) => total + ((item.price * 1000) * item.quantity), 0));
    setVoucherCode("");
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

    const userStr = localStorage.getItem("user");
    console.log("User from localStorage:", userStr);
    
    let user = {};
    try {
      user = JSON.parse(userStr || "{}");
    } catch (error) {
      console.error("Error parsing user:", error);
    }
    
    console.log("Parsed user:", user);
    
    // Tạm thời sử dụng user ID cố định để test
    const userId = user.id || user.user_id || 1;
    
    // Bỏ qua việc kiểm tra đăng nhập để test
    // if (!userId) {
    //   alert("Vui lòng đăng nhập!");
    //   navigate("/login");
    //   return;
    // }

    const orderData = {
      userId: user.id,
      items: selectedProducts,
      totalAmount,
      address,
      paymentMethod,
      status: "Chờ xử lý",
      createdAt: new Date().toISOString(),
    };

    if (paymentMethod === "Ví điện tử (Momo/ZaloPay)") {
      alert("Vui lòng quét mã Momo và chuyển khoản xong hãy nhấn OK.");
    }

    try {
      const res = await fetch("http://localhost:8000/api/test-order", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: userId,
          total_amount: finalAmount,
          voucher_code: appliedVoucher?.code || null,
          discount_amount: discountAmount,
          items: selectedProducts.map(item => ({
            variant_id: item.id,
            quantity: item.quantity,
            price: item.price * 1000
          }))
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Lỗi server");
      }
      
      const data = await res.json();
      console.log("Response data:", data);
      
      // Chuyển đến trang OrderSuccess với đầy đủ thông tin
      navigate("/order-success", {
        state: {
          orderId: data.data?.id || data.id || "001",
          address: {
            street: address.street,
            ward: address.ward,
            district: address.district,
            province: address.province
          },
          totalAmount: finalAmount,
          paymentMethod: paymentMethod,
          createdAt: new Date().toISOString(),
          items: selectedProducts,
          customerName: user.name || "Khách hàng",
          customerPhone: user.phone || "",
          voucherCode: appliedVoucher?.code || null,
          discountAmount: discountAmount
        },
      });
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      alert(error instanceof Error ? error.message : "Xảy ra lỗi, thử lại sau.");
    }
  };

  return (
    <div className="container my-5">
      <h2 className="fw-bold text-center">🛍️ Thanh toán</h2>
      <div className="row">
        <div className="col-lg-6">
          <h4 className="fw-bold">Đơn hàng</h4>
          {selectedProducts.map((item) => (
            <div key={item.id} className="border-bottom py-2">
              <p>
                {item.name} x {item.quantity}
              </p>
              <p>{((item.price * 1000) * item.quantity).toLocaleString()} VND</p>
            </div>
          ))}
          <h5 className="mt-3">
            Tổng: <span className="text-danger">
              {selectedProducts.reduce((total, item) => total + ((item.price * 1000) * item.quantity), 0).toLocaleString()} VND
            </span>
          </h5>
          
          {appliedVoucher && (
            <div className="mt-2 p-2 bg-success bg-opacity-10 border border-success rounded">
              <p className="mb-1"><b>Voucher áp dụng:</b> {appliedVoucher.code}</p>
              <p className="mb-1 text-success">Giảm giá: {discountAmount.toLocaleString()} VND</p>
              <p className="mb-0"><b>Thành tiền:</b> <span className="text-danger fw-bold">{finalAmount.toLocaleString()} VND</span></p>
            </div>
          )}
        </div>

        <div className="col-lg-6">
          <h4 className="fw-bold">Thông tin giao hàng</h4>

          <select className="form-select my-2" onChange={(e) => handleProvinceChange(e.target.value)}>
            <option value="">Chọn Tỉnh/Thành</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>

          <select className="form-select my-2" onChange={(e) => handleDistrictChange(e.target.value)} disabled={!districts.length}>
            <option value="">Chọn Quận/Huyện</option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>

          <select className="form-select my-2" onChange={(e) => setAddress({ ...address, ward: e.target.value })} disabled={!wards.length}>
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
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
          />

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
          
          {availableVouchers.length > 0 && (
            <div className="mb-3">
              <small className="text-muted">Voucher có sẵn:</small>
              <div className="mt-1">
                {availableVouchers.map((voucher, index) => (
                  <span 
                    key={index}
                    className="badge bg-light text-dark me-2 mb-1"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setVoucherCode(voucher.code)}
                    title={voucher.description}
                  >
                    {voucher.code} - {voucher.value <= 100 ? `${voucher.value}%` : `${voucher.value.toLocaleString()} VND`}
                  </span>
                ))}
              </div>
            </div>
          )}

          <h4 className="fw-bold mt-4">Phương thức thanh toán</h4>
          <select className="form-select my-2" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="">Chọn</option>
            {paymentMethods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {paymentMethod === "Chuyển khoản ngân hàng" && (
            <div className="mt-4 text-center">
              <h5>QR chuyển khoản MB Bank</h5>
              <img
                src={`https://img.vietqr.io/image/${mbBankCode}-${mbAccount}-${qrTemplate}.png?amount=${totalAmount}&addInfo=Thanh%20toan%20don%20hang%20StrideX`}
                alt="QR MB Bank"
                style={{ width: 200, height: 200 }}
              />
              <p className="mt-3">
                <b>Số TK:</b> {mbAccount} <br />
                <b>Ngân hàng:</b> MB Bank <br />
                <b>Chủ TK:</b> LÊ KHẢI HOÀN <br />
                <b>Số tiền:</b> <span className="text-danger fw-bold">{totalAmount.toLocaleString()} VND</span>
              </p>
            </div>
          )}

          {paymentMethod === "Ví điện tử (Momo/ZaloPay)" && (
            <div className="mt-4 text-center">
              <h5>QR thanh toán ví Momo</h5>
              <img src="/qr-momo.png" alt="QR Momo" style={{ width: 200, height: 200 }} />
              <p className="mt-3">
                <b>Số điện thoại:</b> {momoPhone} <br />
                <b>Chủ ví:</b> {momoName}
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