import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import axios from "axios";

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
    street: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("");

  const mbAccount = "0686809012005";
  const mbBankCode = "970422";
  const qrTemplate = "compact";

  const momoPhone = "0867426658";
  const momoName = "LÊ KHẢI HOÀN";

  useEffect(() => {
    axios.get<Province[]>("https://provinces.open-api.vn/api/?depth=3")
      .then(res => setProvinces(res.data))
      .catch(() => alert("Không thể tải địa chỉ"));
  }, []);

  const handleProvinceChange = (code: string) => {
    const selected = provinces.find(p => p.code.toString() === code);
    setDistricts(selected?.districts || []);
    setWards([]);
    setAddress({
      province: selected?.name || "",
      district: "",
      ward: "",
      street: ""
    });
  };

  const handleDistrictChange = (code: string) => {
    const selected = districts.find(d => d.code.toString() === code);
    setWards(selected?.wards || []);
    setAddress((prev) => ({
      ...prev,
      district: selected?.name || "",
      ward: "",
    }));
  };

  const handleOrder = async () => {
    if (!address.province || !address.district || !address.ward || !address.street || !paymentMethod) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) {
      alert("Vui lòng đăng nhập!");
      navigate("/login");
      return;
    }

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
      const res = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) throw new Error("Lỗi server");
      alert("Đặt hàng thành công!");
      navigate("/orders");
    } catch {
      alert("Xảy ra lỗi, thử lại sau.");
    }
  };

  return (
    <>
      <Header />
      <div className="container my-5">
        <h2 className="fw-bold text-center">🛍️ Thanh toán</h2>
        <div className="row">
          {/* Sản phẩm */}
          <div className="col-lg-6">
            <h4 className="fw-bold">Đơn hàng</h4>
            {selectedProducts.map(item => (
              <div key={item.id} className="border-bottom py-2">
                <p>{item.name} x {item.quantity}</p>
                <p>{(item.price * item.quantity).toLocaleString()} VND</p>
              </div>
            ))}
            <h5 className="mt-3">
              Tổng: <span className="text-danger">{totalAmount.toLocaleString()} VND</span>
            </h5>
          </div>

          {/* Form */}
          <div className="col-lg-6">
            <h4 className="fw-bold">Thông tin giao hàng</h4>

            {/* Tỉnh */}
            <select className="form-select my-2" onChange={e => handleProvinceChange(e.target.value)}>
              <option value="">Chọn Tỉnh/Thành</option>
              {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
            </select>

            {/* Huyện */}
            <select className="form-select my-2" onChange={e => handleDistrictChange(e.target.value)} disabled={!districts.length}>
              <option value="">Chọn Quận/Huyện</option>
              {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
            </select>

            {/* Xã */}
            <select className="form-select my-2" onChange={e => setAddress({ ...address, ward: e.target.value })} disabled={!wards.length}>
              <option value="">Chọn Xã/Phường</option>
              {wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
            </select>

            <input
              type="text"
              className="form-control my-2"
              placeholder="Số nhà, đường..."
              value={address.street}
              onChange={e => setAddress({ ...address, street: e.target.value })}
            />

            <h4 className="fw-bold mt-4">Phương thức thanh toán</h4>
            <select className="form-select my-2" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="">Chọn</option>
              {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            {/* QR MB Bank */}
            {paymentMethod === "Chuyển khoản ngân hàng" && (
              <div className="mt-4 text-center">
                <h5>QR chuyển khoản MB Bank</h5>
                <img
                  src={`https://img.vietqr.io/image/${mbBankCode}-${mbAccount}-${qrTemplate}.png`}
                  alt="QR MB Bank"
                  style={{ width: 200, height: 200 }}
                />
                <p className="mt-3">
                  <b>Số TK:</b> {mbAccount} <br />
                  <b>Ngân hàng:</b> MB Bank <br />
                  <b>Chủ TK:</b> LÊ KHẢI HOÀN
                </p>
              </div>
            )}

            {/* QR Momo */}
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
      <Footer />
    </>
  );
};

export default CheckoutPage;
