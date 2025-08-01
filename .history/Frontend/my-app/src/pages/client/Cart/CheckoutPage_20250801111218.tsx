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
      .get<Province[]>("https://provinces.open-api.vn/api/p/?depth=3") // ✅ đã fix URL
      .then((res) => {
        console.log("✅ Fetch provinces thành công:", res.data);
        setProvinces(res.data);
      })
      .catch((err) => {
        console.error("❌ Lỗi khi fetch provinces:", err);
        alert("Không thể tải địa chỉ");
      });
  }, []);

  useEffect(() => {
    const newTotal = selectedProducts.reduce(
      (total, item) => total + item.price * 1000 * item.quantity,
      0
    );
    setFinalAmount(newTotal);
  }, [selectedProducts, totalAmount]);

  const handleProvinceChange = (code: string) => {
    const selected = provinces.find((p) => p.code.toString() === code);
    console.log("➡️ Tỉnh được chọn:", selected);
    if (selected) {
      setDistricts(selected.districts || []);
      setWards([]);
      setAddress({
        province: selected.name,
        district: "",
        ward: "",
        street: "",
      });
      console.log("✅ Danh sách quận/huyện:", selected.districts);
    }
  };

  const handleDistrictChange = (code: string) => {
    const selected = districts.find((d) => d.code.toString() === code);
    console.log("➡️ Quận/huyện được chọn:", selected);
    if (selected) {
      setWards(selected.wards || []);
      setAddress((prev) => ({
        ...prev,
        district: selected.name,
        ward: "",
      }));
      console.log("✅ Danh sách xã/phường:", selected.wards);
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

    console.log("🧾 Thông tin đặt hàng:");
    console.log("✔️ Địa chỉ:", address);
    console.log("✔️ Phương thức:", paymentMethod);
    console.log("✔️ Sản phẩm:", selectedProducts);
    console.log("✔️ Tổng tiền:", finalAmount);

    alert("Đơn hàng đã được xử lý demo!");
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
              <p>{(item.price * 1000 * item.quantity).toLocaleString()} VND</p>
            </div>
          ))}
          <h5 className="mt-3 text-danger fw-bold">
            Tổng: {finalAmount.toLocaleString()} VND
          </h5>
        </div>

        <div className="col-lg-6">
          <h4 className="fw-bold">Thông tin giao hàng</h4>

          <select
            className="form-select my-2"
            onChange={(e) => handleProvinceChange(e.target.value)}
          >
            <option value="">Chọn Tỉnh/Thành</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            className="form-select my-2"
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

          <select
            className="form-select my-2"
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

          <button className="btn btn-success w-100 mt-3" onClick={handleOrder}>
            Hoàn tất đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
