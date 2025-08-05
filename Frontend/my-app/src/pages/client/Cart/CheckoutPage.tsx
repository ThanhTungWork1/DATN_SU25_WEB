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

  useEffect(() => {
    const newTotal = selectedProducts.reduce(
      (total, item) => total + item.price * 1000 * item.quantity,
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
      const response = await fetch("http://localhost:8000/api/test-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherCode, total_amount: finalAmount }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setAppliedVoucher(data.data.voucher);
        setDiscountAmount(data.data.discount_amount);
        setFinalAmount(data.data.final_amount);
        alert(
          `Voucher hợp lệ! Giảm giá: ${data.data.discount_amount.toLocaleString()} VND`
        );
      } else {
        alert(data.message || "Voucher không hợp lệ");
      }
    } catch (error) {
      console.error("Voucher error:", error);
      alert("Có lỗi xảy ra khi kiểm tra voucher");
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    const newTotal = selectedProducts.reduce(
      (total, item) => total + item.price * 1000 * item.quantity,
      0
    );
    setFinalAmount(newTotal);
    setVoucherCode("");
  };

  const clearOrderedItems = async () => {
    try {
      await clearCart();
      console.log("✅ Đã xóa toàn bộ giỏ hàng sau khi đặt hàng thành công");
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

    const orderData = {
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

    if (paymentMethod.includes("chuyển khoản")) {
      alert(
        `Vui lòng chuyển khoản ${finalAmount.toLocaleString()} VND rồi nhấn OK.`
      );
    }

    try {
      const orderRes = await fetch("http://localhost:8000/api/test-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.message || "Lỗi tạo đơn hàng");
      }

      const orderData_response = await orderRes.json();
      const orderId = orderData_response.data?.id;

      if (!orderId) {
        throw new Error("Không nhận được ID đơn hàng");
      }

      const paymentData = {
        order_id: orderId,
        method: paymentMethod,
        amount: finalAmount,
        transaction_id: `TXN_${Date.now()}_${orderId}`,
        bank_code: paymentMethod === "Chuyển khoản ngân hàng" ? "MB" : null,
      };

      const paymentRes = await fetch("http://localhost:8000/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!paymentRes.ok) {
        const errorData = await paymentRes.json();
        throw new Error(errorData.message || "Lỗi tạo thanh toán");
      }

      const paymentResponse = await paymentRes.json();

      await clearOrderedItems();

      alert("Đặt hàng thành công!");
      navigate("/order-success", {
        state: {
          orderId: orderId,
          address,
          totalAmount: finalAmount,
          paymentMethod,
          createdAt: new Date().toISOString(),
          items: selectedProducts,
          customerName: user.name || user.username || "Khách hàng",
          customerPhone: user.phone || "",
          voucherCode: appliedVoucher?.code || null,
          discountAmount: discountAmount,
          paymentStatus: paymentResponse.payment?.status || "pending",
        },
      });
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.message || "Xảy ra lỗi, thử lại sau.");
    }
  };

  return (
    <div className="container my-5">
      <h2 className="fw-bold text-center">🛍️ Thanh toán</h2>
      {/* ... UI giữ nguyên như bạn gửi ... */}
    </div>
  );
};

export default CheckoutPage;
