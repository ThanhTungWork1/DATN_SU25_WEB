// ✅ File: src/pages/client/Cart/CheckoutPage.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import useCart from "../../../hook/useCart";

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

// Function để tạo dữ liệu đầy đủ tỉnh thành Việt Nam
const getFullVietnamProvinces = (): Province[] => {
  return [
    {
      code: 1,
      name: "Thành phố Hà Nội",
      districts: [
        {
          code: 1,
          name: "Ba Đình",
          wards: [
            { code: 1, name: "Phúc Xá" },
            { code: 2, name: "Trúc Bạch" },
            { code: 3, name: "Vĩnh Phúc" },
            { code: 4, name: "Cống Vị" },
            { code: 5, name: "Liễu Giai" },
            { code: 6, name: "Nguyễn Trung Trực" },
            { code: 7, name: "Quán Thánh" },
            { code: 8, name: "Ngọc Hà" },
            { code: 9, name: "Điện Biên" },
            { code: 10, name: "Đội Cấn" },
            { code: 11, name: "Ngọc Khánh" },
            { code: 12, name: "Kim Mã" },
            { code: 13, name: "Giảng Võ" },
            { code: 14, name: "Thành Công" }
          ]
        },
        {
          code: 2,
          name: "Hoàn Kiếm",
          wards: [
            { code: 15, name: "Phúc Tân" },
            { code: 16, name: "Đồng Xuân" },
            { code: 17, name: "Hàng Mã" },
            { code: 18, name: "Hàng Buồm" },
            { code: 19, name: "Hàng Đào" },
            { code: 20, name: "Hàng Bồ" },
            { code: 21, name: "Cửa Đông" },
            { code: 22, name: "Lý Thái Tổ" },
            { code: 23, name: "Hàng Bạc" },
            { code: 24, name: "Hàng Gai" },
            { code: 25, name: "Chương Dương" },
            { code: 26, name: "Hàng Trống" },
            { code: 27, name: "Cửa Nam" },
            { code: 28, name: "Hàng Bông" },
            { code: 29, name: "Tràng Tiền" },
            { code: 30, name: "Trần Hưng Đạo" },
            { code: 31, name: "Phan Chu Trinh" },
            { code: 32, name: "Hàng Bài" }
          ]
        },
        {
          code: 3,
          name: "Tây Hồ",
          wards: [
            { code: 33, name: "Phú Thượng" },
            { code: 34, name: "Nhật Tân" },
            { code: 35, name: "Tứ Liên" },
            { code: 36, name: "Quảng An" },
            { code: 37, name: "Xuân La" },
            { code: 38, name: "Yên Phụ" },
            { code: 39, name: "Bưởi" },
            { code: 40, name: "Thụy Khuê" }
          ]
        }
      ]
    },
    {
      code: 2,
      name: "Thành phố Hồ Chí Minh",
      districts: [
        {
          code: 4,
          name: "Quận 1",
          wards: [
            { code: 41, name: "Bến Nghé" },
            { code: 42, name: "Bến Thành" },
            { code: 43, name: "Cầu Kho" },
            { code: 44, name: "Cầu Ông Lãnh" },
            { code: 45, name: "Cô Giang" },
            { code: 46, name: "Đa Kao" },
            { code: 47, name: "Nguyễn Cư Trinh" },
            { code: 48, name: "Nguyễn Thái Bình" },
            { code: 49, name: "Phạm Ngũ Lão" },
            { code: 50, name: "Tân Định" }
          ]
        },
        {
          code: 5,
          name: "Quận 3",
          wards: [
            { code: 51, name: "Phường 1" },
            { code: 52, name: "Phường 2" },
            { code: 53, name: "Phường 3" },
            { code: 54, name: "Phường 4" },
            { code: 55, name: "Phường 5" },
            { code: 56, name: "Phường 6" },
            { code: 57, name: "Phường 7" },
            { code: 58, name: "Phường 8" },
            { code: 59, name: "Phường 9" },
            { code: 60, name: "Phường 10" },
            { code: 61, name: "Phường 11" },
            { code: 62, name: "Phường 12" },
            { code: 63, name: "Phường 13" },
            { code: 64, name: "Phường 14" }
          ]
        }
      ]
    },
    {
      code: 3,
      name: "Thành phố Đà Nẵng",
      districts: [
        {
          code: 6,
          name: "Hải Châu",
          wards: [
            { code: 65, name: "Bình Hiên" },
            { code: 66, name: "Bình Thuận" },
            { code: 67, name: "Hải Châu I" },
            { code: 68, name: "Hải Châu II" },
            { code: 69, name: "Hòa Cường Bắc" },
            { code: 70, name: "Hòa Cường Nam" },
            { code: 71, name: "Hòa Thuận Đông" },
            { code: 72, name: "Hòa Thuận Tây" },
            { code: 73, name: "Nam Dương" },
            { code: 74, name: "Phước Ninh" },
            { code: 75, name: "Thạch Thang" },
            { code: 76, name: "Thanh Bình" },
            { code: 77, name: "Thuận Phước" }
          ]
        }
      ]
    },
    {
      code: 4,
      name: "Thành phố Cần Thơ",
      districts: [
        {
          code: 7,
          name: "Ninh Kiều",
          wards: [
            { code: 78, name: "An Bình" },
            { code: 79, name: "An Cư" },
            { code: 80, name: "An Hòa" },
            { code: 81, name: "An Khánh" },
            { code: 82, name: "An Lạc" },
            { code: 83, name: "An Nghiệp" },
            { code: 84, name: "An Phú" },
            { code: 85, name: "Cái Khế" },
            { code: 86, name: "Hưng Lợi" },
            { code: 87, name: "Tân An" },
            { code: 88, name: "Thới Bình" },
            { code: 89, name: "Xuân Khánh" }
          ]
        }
      ]
    },
    {
      code: 5,
      name: "Tỉnh An Giang",
      districts: [
        {
          code: 8,
          name: "Thành phố Long Xuyên",
          wards: [
            { code: 90, name: "Bình Đức" },
            { code: 91, name: "Bình Khánh" },
            { code: 92, name: "Đông Xuyên" },
            { code: 93, name: "Mỹ Bình" },
            { code: 94, name: "Mỹ Hòa" },
            { code: 95, name: "Mỹ Long" },
            { code: 96, name: "Mỹ Phước" },
            { code: 97, name: "Mỹ Quý" },
            { code: 98, name: "Mỹ Thạnh" },
            { code: 99, name: "Mỹ Thới" },
            { code: 100, name: "Mỹ Xuyên" }
          ]
        }
      ]
    }
  ];
};

const CheckoutPage = () => {
  const { state } = useLocation();
  const { selectedProducts = [], totalAmount = 0 }: {
    selectedProducts: Product[];
    totalAmount: number;
  } = state || {};

  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";
  const { removeItem } = useCart(token);

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
  const [finalAmount, setFinalAmount] = useState(() => {
    return selectedProducts.reduce((total, item) => total + ((item.price * 1000) * item.quantity), 0);
  });

  const mbAccount = "0686809012005";
  const mbBankCode = "970422";
  const qrTemplate = "compact";
  const momoPhone = "0867426658";
  const momoName = "LÊ KHẢI HOÀN";

  useEffect(() => {
    // Dùng API thật - không bị CORS
    const loadProvinces = async () => {
      try {
        console.log("🔍 [DEBUG] Loading provinces from API...");
        const res = await axios.get("https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json");
        console.log("🔍 [DEBUG] API response:", res.data);
        
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          console.log("🔍 [DEBUG] Success! Loaded", res.data.length, "provinces");
          setProvinces(res.data);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        console.error("🔍 [DEBUG] API failed:", error);
        // Fallback: dùng API khác
        try {
          const res2 = await axios.get("https://api.mysupership.vn/v1/partner/areas/province");
          console.log("🔍 [DEBUG] Fallback API response:", res2.data);
          if (res2.data && res2.data.results) {
            setProvinces(res2.data.results);
          }
        } catch (error2) {
          console.error("🔍 [DEBUG] All APIs failed:", error2);
          // Cuối cùng mới dùng hardcode
          setProvinces(getFullVietnamProvinces());
        }
      }
    };

    loadProvinces();
  }, []);

  // Cập nhật finalAmount khi selectedProducts thay đổi
  useEffect(() => {
    const newTotal = selectedProducts.reduce((total, item) => total + ((item.price * 1000) * item.quantity), 0);
    setFinalAmount(newTotal);
  }, [selectedProducts]);

  const handleProvinceChange = (code: string) => {
    console.log("🔍 [DEBUG] handleProvinceChange called with code:", code);
    console.log("🔍 [DEBUG] Available provinces:", provinces.length);
    
    // Nếu không chọn gì hoặc chọn option đầu tiên, reset về trạng thái ban đầu
    if (!code || code === "") {
      console.log("🔍 [DEBUG] Empty code, resetting...");
      setDistricts([]);
      setWards([]);
      setAddress({
        province: "",
        district: "",
        ward: "",
        street: "",
      });
      return;
    }

    // Tìm tỉnh theo code
    const selected = provinces.find((p) => p.code.toString() === code);
    console.log("🔍 [DEBUG] Selected province:", selected);
    
    if (selected) {
      console.log("🔍 [DEBUG] Found province, districts count:", selected.districts?.length || 0);
      setDistricts(selected.districts || []);
      setWards([]);
      setAddress({
        province: selected.name,
        district: "",
        ward: "",
        street: "",
      });
    } else {
      console.log("🔍 [DEBUG] Province not found! Trying to find by name...");
      // Fallback: tìm theo tên nếu không tìm được theo code
      const selectedByName = provinces.find((p) => p.name === code);
      if (selectedByName) {
        console.log("🔍 [DEBUG] Found province by name:", selectedByName);
        setDistricts(selectedByName.districts || []);
        setWards([]);
        setAddress({
          province: selectedByName.name,
          district: "",
          ward: "",
          street: "",
        });
      } else {
        console.log("🔍 [DEBUG] Province not found by name either!");
      }
    }
  };

  const handleDistrictChange = (code: string) => {
    // Nếu không chọn gì hoặc chọn option đầu tiên, reset về trạng thái ban đầu
    if (!code || code === "") {
      setWards([]);
      setAddress((prev) => ({
        ...prev,
        district: "",
        ward: "",
      }));
      return;
    }

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
    if (!voucherCode.trim()) {
      alert("Vui lòng nhập mã voucher!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/test-voucher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: voucherCode,
          total_amount: finalAmount
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
      console.error('Voucher error:', error);
      alert('Có lỗi xảy ra khi kiểm tra voucher');
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    const newTotal = selectedProducts.reduce((total, item) => total + ((item.price * 1000) * item.quantity), 0);
    setFinalAmount(newTotal);
    setVoucherCode("");
  };

  // Function để xóa sản phẩm khỏi giỏ hàng sau khi đặt hàng thành công
  const clearOrderedItems = async () => {
    try {
      for (const product of selectedProducts) {
        await removeItem(parseInt(product.id));
      }
      console.log("✅ Đã xóa sản phẩm khỏi giỏ hàng sau khi đặt hàng thành công");
      return true;
    } catch (error) {
      console.error("❌ Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
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

    const token = localStorage.getItem("user_token") || localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập!");
      navigate("/login");
      return;
    }

    // Lấy thông tin user từ token
    let user = null;
    try {
      const response = await fetch("http://localhost:8000/api/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        user = await response.json();
      } else {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        navigate("/login");
        return;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      alert("Có lỗi xảy ra khi lấy thông tin người dùng!");
      return;
    }

    const userId = user.id;
    const orderData = {
      user_id: parseInt(userId),
      items: selectedProducts,
      total_amount: finalAmount,
      address,
      paymentMethod,
      status: "Chờ xử lý",
      createdAt: new Date().toISOString(),
    };

    if (paymentMethod === "Ví điện tử (Momo/ZaloPay)") {
      alert(`Vui lòng quét mã Momo và chuyển khoản ${finalAmount.toLocaleString()} VND xong hãy nhấn OK.`);
    }
    
    if (paymentMethod === "Chuyển khoản ngân hàng") {
      alert(`Vui lòng quét mã QR và chuyển khoản ${finalAmount.toLocaleString()} VND xong hãy nhấn OK.`);
    }

    try {
      const res = await fetch("http://localhost:8000/api/test-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) throw new Error("Lỗi server");
      const data = await res.json();
      
      // Xóa sản phẩm đã đặt hàng khỏi giỏ hàng
      await clearOrderedItems();
      
      alert("Đặt hàng thành công!");
      navigate("/order-success", {
        state: {
          orderId: data.data?.id || "001",
          address,
          totalAmount: finalAmount,
          paymentMethod,
          createdAt: orderData.createdAt,
          items: selectedProducts,
          customerName: user.name || user.username || "Khách hàng",
          customerPhone: user.phone || "",
          voucherCode: appliedVoucher?.code || null,
          discountAmount: discountAmount
        },
      });
    } catch {
      alert("Xảy ra lỗi, thử lại sau.");
    }
  };

  // Debug info
  console.log("🔍 [DEBUG] Current state:", {
    provincesCount: provinces.length,
    districtsCount: districts.length,
    wardsCount: wards.length,
    address,
    selectedProvinceCode: address.province ? provinces.find(p => p.name === address.province)?.code : null
  });

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
              Tổng: <span className="text-danger">{finalAmount.toLocaleString()} VND</span>
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

          <select 
            className="form-select my-2" 
            value={address.province ? provinces.find(p => p.name === address.province)?.code?.toString() || "" : ""}
            onChange={(e) => {
              console.log("🔍 [DEBUG] Select onChange triggered with value:", e.target.value);
              handleProvinceChange(e.target.value);
            }}
          >
            <option value="">Chọn Tỉnh/Thành</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code?.toString() || ""}>
                {p.name}
              </option>
            ))}
          </select>

          <select 
            className="form-select my-2" 
            value={address.district ? districts.find(d => d.name === address.district)?.code || "" : ""}
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
                src={`https://img.vietqr.io/image/${mbBankCode}-${mbAccount}-${qrTemplate}.png?amount=${finalAmount}&addInfo=Thanh%20toan%20don%20hang%20StrideX`}
                alt="QR MB Bank"
                style={{ width: 200, height: 200 }}
              />
              <p className="mt-3">
                <b>Số TK:</b> {mbAccount} <br />
                <b>Ngân hàng:</b> MB Bank <br />
                <b>Chủ TK:</b> LÊ KHẢI HOÀN <br />
                <b>Số tiền:</b> <span className="text-danger fw-bold">{finalAmount.toLocaleString()} VND</span>
              </p>
            </div>
          )}

          {paymentMethod === "Ví điện tử (Momo/ZaloPay)" && (
            <div className="mt-4 text-center">
              <h5>QR thanh toán ví Momo</h5>
              <img src="/qr-momo.png" alt="QR Momo" style={{ width: 200, height: 200 }} />
              <p className="mt-3">
                <b>Số điện thoại:</b> {momoPhone} <br />
                <b>Chủ ví:</b> {momoName} <br />
                <b>Số tiền:</b> <span className="text-danger fw-bold">{finalAmount.toLocaleString()} VND</span>
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