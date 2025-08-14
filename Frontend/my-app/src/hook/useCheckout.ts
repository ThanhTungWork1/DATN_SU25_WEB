import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Address, Product, Voucher } from "../types/Checkout";

// --- Type Definitions for API Responses ---
interface GeoUnit {
  name: string;
  code: number;
}
interface Province extends GeoUnit {
  districts?: District[];
}
interface District extends GeoUnit {
  wards?: Ward[];
}
interface Ward extends GeoUnit {}

interface VoucherApiResponse {
  voucher: Voucher;
  discount_amount: number;
}

interface OrderApiResponse {
  data: {
    id: number;
    created_at: string;
    // Add other properties from your order response
  };
}

export const useCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { 
    selectedProducts = [], 
    totalAmount = 0, 
    fromBuyNow = false 
  } = location.state || {};

  const displayTotalAmount = fromBuyNow ? totalAmount * 1000 : totalAmount;

  const [address, setAddress] = useState<Address>({
    street: "",
    ward: "",
    district: "",
    province: "",
  });

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("Thanh toán khi nhận hàng (COD)");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get<Province[]>("https://provinces.open-api.vn/api/p/");
        setProvinces(response.data);
      } catch (error) {}
    };
    fetchProvinces();
  }, []);

  const handleProvinceChange = async (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId("");
    setDistricts([]);
    setWards([]);
    const selectedProvince = provinces.find((p) => p.code.toString() === provinceId);
    setAddress((prev) => ({ ...prev, province: selectedProvince?.name || "", district: "", ward: "" }));
    if (provinceId) {
      try {
        const response = await axios.get<Province>(`https://provinces.open-api.vn/api/p/${provinceId}?depth=2`);
        setDistricts(response.data.districts || []);
      } catch (error) {}
    }
  };

  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrictId(districtId);
    setWards([]);
    const selectedDistrict = districts.find((d) => d.code.toString() === districtId);
    setAddress((prev) => ({ ...prev, district: selectedDistrict?.name || "", ward: "" }));
    if (districtId) {
      try {
        const response = await axios.get<District>(`https://provinces.open-api.vn/api/d/${districtId}?depth=2`);
        setWards(response.data.wards || []);
      } catch (error) {}
    }
  };

  const handleWardChange = (wardId: string) => {
    const selectedWard = wards.find((w) => w.code.toString() === wardId);
    setAddress((prev) => ({ ...prev, ward: selectedWard?.name || "" }));
  };

  const shippingFee = 30000;
  const finalAmount = displayTotalAmount + shippingFee - discountAmount;

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) return alert("Vui lòng nhập mã voucher");
    setIsValidatingVoucher(true);
    try {
      const response = await axios.post<VoucherApiResponse>("http://localhost:8000/api/test-voucher", { code: voucherCode, order_amount: totalAmount }, { headers: { Authorization: `Bearer ${token}` } });
      const voucher = response.data?.voucher;
      const discount = response.data?.discount_amount || 0;
      if (voucher) {
        setAppliedVoucher(voucher);
        setDiscountAmount(discount);
        alert(`Áp dụng voucher thành công! Giảm ${discount.toLocaleString("vi-VN")} VND`);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Mã voucher không hợp lệ");
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setVoucherCode("");
  };

  const clearOrderedItems = async () => {
    try {
      for (const product of selectedProducts as Product[]) {
        await axios.delete(`http://localhost:8000/api/cart/${product.id}`, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (error) {}
  };

  const processOrder = async () => {
    const orderRequestData = {
      user_id: parseInt(user.id),
      shipping_address: `${address.street}, ${address.ward}, ${address.district}, ${address.province}`,
      shipping_phone: user.phone || "0123456789",
      shipping_name: user.name || user.username || "Khách hàng",
      note: `Phương thức thanh toán: ${paymentMethod}`,
      items: (selectedProducts as Product[]).map((item) => ({ variant_id: item.variant_id || 1, quantity: item.quantity, price: item.price })),
    };

    try {
      const orderResponse = await axios.post<OrderApiResponse>("http://localhost:8000/api/test-order", orderRequestData, { headers: { Authorization: `Bearer ${token}` } });
      const orderId = orderResponse.data?.data?.id;
      if (!orderId) throw new Error(`Không nhận được ID đơn hàng`);

      if (paymentMethod !== "Thanh toán khi nhận hàng (COD)") {
        await axios.post("http://localhost:8000/api/payments", { order_id: orderId, amount: finalAmount, method: paymentMethod }, { headers: { Authorization: `Bearer ${token}` } });
      }

      await clearOrderedItems();
      alert("Đặt hàng thành công!");

      navigate("/order-success", {
        state: {
          orderId,
          orderData: orderResponse.data?.data,
          address,
          totalAmount: finalAmount,
          paymentMethod,
          createdAt: orderResponse.data?.data?.created_at || new Date().toISOString(),
          items: selectedProducts,
          customerName: user.name || user.username || "Khách hàng",
          customerPhone: user.phone || "",
          voucherCode: appliedVoucher?.code || null,
          discountAmount,
          paymentStatus: paymentMethod === 'Thanh toán khi nhận hàng (COD)' ? 'pending' : 'paid',
          shippingFee,
          finalOrderAmount: finalAmount,
        },
      });
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || "Xảy ra lỗi, thử lại sau.");
    }
  };

  const handleCheckout = async () => {
    if (!address.street || !address.ward || !address.district || !address.province) {
      return alert("Vui lòng điền đầy đủ địa chỉ giao hàng");
    }
    if ((selectedProducts as Product[]).length === 0) {
      return alert("Không có sản phẩm nào được chọn");
    }
    if (paymentMethod !== "Thanh toán khi nhận hàng (COD)") {
      setShowQRModal(true);
    } else {
      await processOrder();
    }
  };

  return {
    address, setAddress, provinces, districts, wards,
    selectedProvinceId, handleProvinceChange, selectedDistrictId, handleDistrictChange, handleWardChange,
    paymentMethod, setPaymentMethod, voucherCode, setVoucherCode, appliedVoucher, discountAmount,
    handleValidateVoucher, handleRemoveVoucher, isValidatingVoucher,
    finalAmount, displayTotalAmount, shippingFee,
    handleCheckout, showQRModal, setShowQRModal, processOrder,
    selectedProducts,
    user,
    token
  };
};
