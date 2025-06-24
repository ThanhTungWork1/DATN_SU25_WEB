import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

// Sample data
const provinces = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ"];
const districts: Record<string, string[]> = {
  "Hà Nội": ["Ba Đình", "Hoàn Kiếm", "Tây Hồ", "Cầu Giấy", "Đống Đa"],
  "Hồ Chí Minh": ["Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5"],
  "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu"],
  "Hải Phòng": ["Hồng Bàng", "Lê Chân", "Ngô Quyền", "Hải An", "Kiến An"],
  "Cần Thơ": ["Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn", "Thốt Nốt"]
};

const paymentMethods = ["COD", "Chuyển khoản ngân hàng", "Ví điện tử (Momo/ZaloPay)"];

// Optional: Product type (if using TypeScript)
type Product = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

const Checkout = () => {
  const { state } = useLocation();
  const { selectedProducts = [], totalAmount = 0 }: { selectedProducts: Product[]; totalAmount: number } = state || {};
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    province: "",
    district: "",
    street: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("");

  const handleOrder = async () => {
    if (!address.province || !address.district || !address.street || !paymentMethod) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng và chọn phương thức thanh toán.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) {
      alert("Vui lòng đăng nhập để đặt hàng!");
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
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) throw new Error("Lỗi khi đặt hàng");

      alert("Đặt hàng thành công!");
      navigate("/");
    } catch (error) {
      alert("Lỗi kết nối đến server.");
    }
  };

  return (
    <>
      <Header />
      <div className="container my-5">
        <h2 className="fw-bold text-center">🛍️ Thanh toán</h2>
        <div className="row">
          <div className="col-lg-6">
            <h4 className="fw-bold">Sản phẩm đặt mua</h4>
            {selectedProducts.map((item) => (
              <div key={item.id} className="border-bottom py-2">
                <p className="fw-bold">{item.name} x {item.quantity}</p>
                <p>{(item.price * item.quantity).toLocaleString()} VND</p>
              </div>
            ))}
            <h5 className="fw-bold mt-3">
              Tổng tiền: <span className="text-danger">{totalAmount.toLocaleString()} VND</span>
            </h5>
          </div>

          <div className="col-lg-6">
            <h4 className="fw-bold">Thông tin giao hàng</h4>

            <select
              className="form-select my-2"
              value={address.province}
              onChange={(e) =>
                setAddress({ province: e.target.value, district: "", street: "" })
              }
            >
              <option value="">Chọn Tỉnh/Thành</option>
              {provinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>

            <select
              className="form-select my-2"
              value={address.district}
              onChange={(e) =>
                setAddress({ ...address, district: e.target.value })
              }
              disabled={!address.province}
            >
              <option value="">Chọn Quận/Huyện</option>
              {districts[address.province]?.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="form-control my-2"
              placeholder="Số nhà, đường..."
              value={address.street}
              onChange={(e) =>
                setAddress({ ...address, street: e.target.value })
              }
            />

            <h4 className="fw-bold mt-3">Phương thức thanh toán</h4>
            <select
              className="form-select my-2"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">Chọn phương thức</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>

            <button className="btn btn-success w-100 mt-3" onClick={handleOrder}>
              Đặt hàng
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
