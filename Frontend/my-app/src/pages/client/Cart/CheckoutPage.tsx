import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/Navbar";
import Footer from "../../../components/Footer";

// Mẫu list tỉnh – quận (bạn nên cập nhật đầy đủ từ nguồn dữ liệu riêng)
const provinces = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng"];
const districts: Record<string, string[]> = {
  "Hà Nội": ["Ba Đình", "Hoàn Kiếm", "Cầu Giấy"],
  "Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 5"],
  "Đà Nẵng": ["Hải Châu", "Thanh Khê"],
};

const paymentMethods = ["COD", "Chuyển khoản ngân hàng", "Ví điện tử (Momo/ZaloPay)"];

// Kiểu sản phẩm
type Product = { id: string; name: string; quantity: number; price: number; };

const CheckoutPage = () => {
  const { state } = useLocation();
  const {
    selectedProducts = [],
    totalAmount = 0,
  }: { selectedProducts: Product[]; totalAmount: number } = state || {};
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    province: "",
    district: "",
    street: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("");

  // Thông tin MB Bank – VietQR
  const mbAccount = "0686809012005";
  const mbBankCode = "970422";
  const qrTemplate = "compact";

  const handleOrder = async () => {
    if (!address.province || !address.district || !address.street || !paymentMethod) {
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
          {/* Danh sách sản phẩm */}
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

          {/* Form thông tin */}
          <div className="col-lg-6">
            <h4 className="fw-bold">Thông tin giao hàng</h4>
            <select
              className="form-select my-2"
              value={address.province}
              onChange={e =>
                setAddress({ province: e.target.value, district: "", street: "" })
              }
            >
              <option value="">Chọn Tỉnh/Thành</option>
              {provinces.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              className="form-select my-2"
              value={address.district}
              onChange={e =>
                setAddress({ ...address, district: e.target.value })
              }
              disabled={!address.province}
            >
              <option value="">Chọn Quận/Huyện</option>
              {address.province && districts[address.province]?.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <input
              type="text"
              className="form-control my-2"
              placeholder="Số nhà, đường..."
              value={address.street}
              onChange={e => setAddress({ ...address, street: e.target.value })}
            />

            <h4 className="fw-bold mt-4">Phương thức thanh toán</h4>
            <select
              className="form-select my-2"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              <option value="">Chọn</option>
              {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

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
