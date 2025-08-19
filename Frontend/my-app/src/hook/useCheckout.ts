// import { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axiosInstance from "../api/axiosConfig";
// import axios from 'axios'; // Giữ lại cho các API không cần xác thực
// import { Address, Product, Voucher } from "../types/Checkout";

// // --- Type Definitions for API Responses ---
// interface GeoUnit {
//   name: string;
//   code: number;
// }
// interface Province extends GeoUnit {
//   districts?: District[];
// }
// interface District extends GeoUnit {
//   wards?: Ward[];
// }
// interface Ward extends GeoUnit {}

// interface VoucherApiResponse {
//   voucher: Voucher;
//   discount_amount: number;
// }

// interface OrderData {
//   id: number;
//   created_at: string;
//   status: string;
//   is_paid: boolean;
//   total_amount: number;
//   shipping_fee: number;
//   discount_amount: number;
//   final_amount: number;
// }

// interface OrderApiResponse {
//   data: OrderData;
// }

// export const useCheckout = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const {
//     selectedProducts = [],
//     totalAmount = 0,
//     fromBuyNow = false
//   } = location.state || {};

//   const displayTotalAmount = fromBuyNow ? totalAmount * 1000 : totalAmount;

//   const [address, setAddress] = useState<Address>({
//     street: "",
//     ward: "",
//     district: "",
//     province: "",
//   });

//   const [provinces, setProvinces] = useState<Province[]>([]);
//   const [districts, setDistricts] = useState<District[]>([]);
//   const [wards, setWards] = useState<Ward[]>([]);
//   const [selectedProvinceId, setSelectedProvinceId] = useState("");
//   const [selectedDistrictId, setSelectedDistrictId] = useState("");
//   const [selectedWardCode, setSelectedWardCode] = useState("");

//   const [paymentMethod, setPaymentMethod] = useState("Thanh toán khi nhận hàng (COD)");
//   const [voucherCode, setVoucherCode] = useState("");
//   const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
//   const [discountAmount, setDiscountAmount] = useState(0);
//   const [showQRModal, setShowQRModal] = useState(false);
//   const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const token = localStorage.getItem("token") || "";

//   useEffect(() => {
//     const fetchProvinces = async () => {
//       try {
//         const response = await axios.get<Province[]>("https://provinces.open-api.vn/api/p/");
//         setProvinces(response.data);
//       } catch (error) {}
//     };
//     fetchProvinces();
//   }, []);

//   const handleProvinceChange = async (provinceId: string) => {
//     setSelectedProvinceId(provinceId);
//     setSelectedDistrictId("");
//     setSelectedWardCode("");
//     setDistricts([]);
//     setWards([]);

//     const selectedProvince = provinces.find((p) => p.code.toString() === provinceId);
//     const provinceName = selectedProvince?.name || "";

//     setAddress((prev) => ({
//       ...prev,
//       province: provinceName,
//       district: "",
//       ward: "",
//     }));

//     // Tính phí vận chuyển khi tỉnh thay đổi
//     if (provinceName) {
//       try {
//         const response = await axiosInstance.post<ShippingFeeResponse>(
//           "/client/orders/calculate-shipping",
//           {
//             province_name: provinceName,
//             total_amount: displayTotalAmount,
//           }
//         );
//         setShippingFee(response.data.data.shipping_fee);
//       } catch (error) {
//         console.error("Lỗi tính phí vận chuyển:", error);
//         setShippingFee(30000); // Reset về phí mặc định nếu lỗi
//       }
//     } else {
//       setShippingFee(30000); // Reset về phí mặc định nếu không chọn tỉnh
//     }

//     if (provinceId) {
//       try {
//         const response = await axios.get<Province>(`https://provinces.open-api.vn/api/p/${provinceId}?depth=2`);
//         setDistricts(response.data.districts || []);
//       } catch (error) {}
//     }
//   };

//   const handleDistrictChange = async (districtId: string) => {
//     setSelectedDistrictId(districtId);
//     setSelectedWardCode("");
//     setWards([]);
//     const selectedDistrict = districts.find((d) => d.code.toString() === districtId);
//     setAddress((prev) => ({ ...prev, district: selectedDistrict?.name || "", ward: "" }));
//     if (districtId) {
//       try {
//         const response = await axios.get<District>(`https://provinces.open-api.vn/api/d/${districtId}?depth=2`);
//         setWards(response.data.wards || []);
//       } catch (error) {}
//     }
//   };

//   const handleWardChange = (wardCode: string) => {
//     setSelectedWardCode(wardCode);
//     const selectedWard = wards.find((w) => w.code.toString() === wardCode);
//     setAddress((prev) => ({ ...prev, ward: selectedWard?.name || "" }));
//   };

//   const [shippingFee, setShippingFee] = useState(30000);
//   const finalAmount = displayTotalAmount + shippingFee - discountAmount;

//   const handleValidateVoucher = async () => {
//     if (!voucherCode.trim()) return alert("Vui lòng nhập mã voucher");
//     setIsValidatingVoucher(true);
//     try {
//       // Sử dụng displayTotalAmount vì nó đã được chuẩn hóa (nhân 1000 nếu cần)
//       const response = await axiosInstance.post<VoucherApiResponse>("/vouchers/validate", { code: voucherCode, order_amount: displayTotalAmount });
//       const voucher = response.data?.voucher;
//       const discount = response.data?.discount_amount || 0;
//       if (voucher) {
//         setAppliedVoucher(voucher);
//         setDiscountAmount(discount);
//         alert(`Áp dụng voucher thành công! Giảm ${discount.toLocaleString("vi-VN")} VND`);
//       }
//     } catch (error: any) {
//       alert(error.response?.data?.message || "Mã voucher không hợp lệ");
//     } finally {
//       setIsValidatingVoucher(false);
//     }
//   };

//   const handleRemoveVoucher = () => {
//     setAppliedVoucher(null);
//     setDiscountAmount(0);
//     setVoucherCode("");
//   };

//   const clearOrderedItems = async () => {
//     try {
//       for (const product of selectedProducts as Product[]) {
//         await axiosInstance.delete(`/cart/items/${product.id}`);
//       }
//     } catch (error) {}
//   };

//   const processOrder = async () => {
//     const orderRequestData = {
//       user_id: parseInt(user.id),
//       customer_name: user.name || user.username || "Khách hàng",
//       customer_phone: user.phone || "0123456789",
//       shipping_address: `${address.street}, ${address.ward}, ${address.district}, ${address.province}`,
//       shipping_phone: user.phone || "0123456789",
//       shipping_name: user.name || user.username || "Khách hàng",
//       note: `Ghi chú đơn hàng`,
//       payment_method: paymentMethod,
//       voucher_code: appliedVoucher?.code || null,
//       discount_amount: discountAmount,
//       items: (selectedProducts as Product[]).map((item) => ({
//         variant_id: item.variant_id || 1,
//         quantity: item.quantity,
//         price: item.price, // Gửi giá sản phẩm lên backend
//       })),
//     };

//     try {
//       const orderResponse = await axiosInstance.post<OrderApiResponse>("/client/orders", orderRequestData);
//       const orderId = orderResponse.data.data.id;
//       if (!orderId) throw new Error(`Không nhận được ID đơn hàng`);

//       if (paymentMethod !== "Thanh toán khi nhận hàng (COD)") {
//         await axiosInstance.post("/payments", { order_id: orderId, amount: finalAmount, method: paymentMethod });
//       }

//       await clearOrderedItems();
//       alert("Đặt hàng thành công!");

//       const fullOrderData = {
//         ...orderResponse.data.data, // Spread backend data first
//         // Override with corrected values
//         total_amount: orderResponse.data.data.total_amount * 1000,
//         shipping_fee: orderResponse.data.data.shipping_fee * 1000,
//         discount_amount: orderResponse.data.data.discount_amount * 1000,
//         final_amount: orderResponse.data.data.final_amount * 1000,
//         // Add frontend-specific data
//         address,
//         paymentMethod,
//         items: (selectedProducts as Product[]).map((p: Product) => ({ ...p, name: p.name, image: p.image })),
//         customerName: user.name || user.username || "Khách hàng",
//         customerPhone: user.phone || "",
//         voucherCode: appliedVoucher?.code || null,
//       };

//       navigate("/order-success", {
//         state: { orderData: fullOrderData },
//       });
//     } catch (error: any) {
//       alert(error.response?.data?.message || error.message || "Xảy ra lỗi, thử lại sau.");
//     }
//   };

//   const handleCheckout = async () => {
//     if (!address.street || !address.ward || !address.district || !address.province) {
//       return alert("Vui lòng điền đầy đủ địa chỉ giao hàng");
//     }
//     if ((selectedProducts as Product[]).length === 0) {
//       return alert("Không có sản phẩm nào được chọn");
//     }
//     if (paymentMethod !== "Thanh toán khi nhận hàng (COD)") {
//       setShowQRModal(true);
//     } else {
//       await processOrder();
//     }
//   };

//   return {
//     address, setAddress, provinces, districts, wards,
//     selectedProvinceId, handleProvinceChange, selectedDistrictId, handleDistrictChange, selectedWardCode, handleWardChange,
//     paymentMethod, setPaymentMethod, voucherCode, setVoucherCode, appliedVoucher, discountAmount,
//     handleValidateVoucher, handleRemoveVoucher, isValidatingVoucher,
//     finalAmount, displayTotalAmount, shippingFee, setShippingFee,
//     handleCheckout, showQRModal, setShowQRModal, processOrder,
//     selectedProducts,
//     user,
//     token
//   };
// };

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosConfig";
import axios from "axios"; // Giữ lại cho các API không cần xác thực
import { Address, Product, Voucher } from "../types/Checkout";
import { createVNPayPayment } from "../api/ApiUrl";
import { toast } from "sonner";

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

interface ShippingFeeResponse {
  data: {
    shipping_fee: number;
  };
}

export const useCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    selectedProducts = [],
    totalAmount = 0,
    fromBuyNow = false,
  } = location.state || {};

  const displayTotalAmount = fromBuyNow ? totalAmount : totalAmount;

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
  const [selectedWardCode, setSelectedWardCode] = useState("");

  const [paymentMethod, setPaymentMethod] = useState(
    "Thanh toán khi nhận hàng (COD)"
  );
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [shippingFee, setShippingFee] = useState(30000); // Phí vận chuyển mặc định

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("user_token") || "";

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get<Province[]>(
          "https://provinces.open-api.vn/api/p/"
        );
        setProvinces(response.data);
      } catch (error) {
        console.error("Lỗi tải danh sách tỉnh/thành:", error);
      }
    };
    fetchProvinces();
  }, []);

  const handleProvinceChange = async (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId("");
    setSelectedWardCode("");
    setDistricts([]);
    setWards([]);

    const selectedProvince = provinces.find(
      (p) => p.code.toString() === provinceId
    );
    const provinceName = selectedProvince?.name || "";

    setAddress((prev) => ({
      ...prev,
      province: provinceName,
      district: "",
      ward: "",
    }));

    // Tính phí vận chuyển khi tỉnh thay đổi
    if (provinceName) {
      try {
        const payload = {
          province_name: provinceName,
          total_amount: displayTotalAmount,
        };
        console.log("Đang gửi yêu cầu tính phí vận chuyển:", payload);

        const response = await axiosInstance.post<ShippingFeeResponse>(
          "/client/orders/calculate-shipping",
          payload
        );

        console.log("Phản hồi từ API phí vận chuyển:", response.data);
        setShippingFee(response.data.data.shipping_fee);

      } catch (error: any) {
        console.error("Lỗi khi tính phí vận chuyển:", error.response?.data || error.message);
        setShippingFee(30000); // Reset về phí mặc định nếu lỗi
      }
    } else {
      setShippingFee(30000); // Reset về phí mặc định nếu không chọn tỉnh
    }

    if (provinceId) {
      try {
        const response = await axios.get<Province>(
          `https://provinces.open-api.vn/api/p/${provinceId}?depth=2`
        );
        setDistricts(response.data.districts || []);
      } catch (error) {
        console.error("Lỗi tải danh sách quận/huyện:", error);
      }
    }
  };

  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrictId(districtId);
    setSelectedWardCode("");
    setWards([]);
    const selectedDistrict = districts.find(
      (d) => d.code.toString() === districtId
    );
    setAddress((prev) => ({
      ...prev,
      district: selectedDistrict?.name || "",
      ward: "",
    }));
    if (districtId) {
      try {
        const response = await axios.get<District>(
          `https://provinces.open-api.vn/api/d/${districtId}?depth=2`
        );
        setWards(response.data.wards || []);
      } catch (error) {
        console.error("Lỗi tải danh sách phường/xã:", error);
      }
    }
  };

  const handleWardChange = (wardCode: string) => {
    setSelectedWardCode(wardCode);
    const selectedWard = wards.find((w) => w.code.toString() === wardCode);
    setAddress((prev) => ({ ...prev, ward: selectedWard?.name || "" }));
  };

  const finalAmount = displayTotalAmount + shippingFee - discountAmount;

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }
    setIsValidatingVoucher(true);
    try {
      const response = await axiosInstance.post<VoucherApiResponse>(
        "/vouchers/validate",
        { code: voucherCode, order_amount: displayTotalAmount }
      );
      const voucher = response.data?.voucher;
      const discount = response.data?.discount_amount || 0;
      if (voucher) {
        setAppliedVoucher(voucher);
        setDiscountAmount(discount);
        toast.success(
          `Áp dụng voucher thành công! Giảm ${discount.toLocaleString("vi-VN")} VND`
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Mã voucher không hợp lệ");
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
        await axiosInstance.delete(`/cart/items/${product.id}`);
      }
    } catch (error) {
      console.error("Lỗi xóa sản phẩm trong giỏ hàng:", error);
    }
  };

  const processOrder = async () => {
    const orderRequestData = {
      user_id: parseInt(user.id),
      customer_name: user.name || user.username || "Khách hàng",
      customer_phone: user.phone || "0123456789",
      shipping_address: `${address.street}, ${address.ward}, ${address.district}, ${address.province}`,
      shipping_phone: user.phone || "0123456789",
      shipping_name: user.name || user.username || "Khách hàng",
      note: `Ghi chú đơn hàng`,
      payment_method: paymentMethod,
      province_name: address.province, // Gửi tên tỉnh/thành phố
      voucher_code: appliedVoucher?.code || null,
      discount_amount: discountAmount,
      items: (selectedProducts as Product[]).map((item) => ({
        variant_id: item.variant_id || 1,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      const orderResponse = await axiosInstance.post<OrderApiResponse>(
        "/client/orders",
        orderRequestData
      );
      const orderId = orderResponse.data?.data?.id;
      if (!orderId) throw new Error(`Không nhận được ID đơn hàng`);

      if (paymentMethod === "VNPay") {
        try {
          const vnpayResponse = await createVNPayPayment(orderId, token);
          if ((vnpayResponse.data as any)?.payment_url) {
            window.location.href = (vnpayResponse.data as any).payment_url;
            return;
          }
        } catch (vnpayError: any) {
          console.error("VNPay payment error:", vnpayError);
          toast.error(
            "Không thể tạo thanh toán VNPay. Vui lòng thử lại hoặc chọn phương thức khác."
          );
          return;
        }
      }

      if (
        paymentMethod !== "Thanh toán khi nhận hàng (COD)" &&
        paymentMethod !== "VNPay"
      ) {
        await axiosInstance.post("/payments", {
          order_id: orderId,
          amount: finalAmount,
          method: paymentMethod,
        });
      }

      await clearOrderedItems();
      toast.success("Đặt hàng thành công!");

      navigate("/order-success", {
        state: {
          orderId,
          orderData: orderResponse.data?.data,
          address,
          totalAmount: finalAmount,
          paymentMethod,
          createdAt:
            orderResponse.data?.data?.created_at || new Date().toISOString(),
          items: selectedProducts,
          customerName: user.name || user.username || "Khách hàng",
          customerPhone: user.phone || "",
          voucherCode: appliedVoucher?.code || null,
          discountAmount,
          paymentStatus:
            paymentMethod === "Thanh toán khi nhận hàng (COD)"
              ? "pending"
              : "paid",
          shippingFee,
          finalOrderAmount: finalAmount,
        },
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Xảy ra lỗi, thử lại sau."
      );
    }
  };

  const handleCheckout = async () => {
    if (
      !address.street ||
      !address.ward ||
      !address.district ||
      !address.province
    ) {
      toast.error("Vui lòng điền đầy đủ địa chỉ giao hàng");
      return;
    }
    if ((selectedProducts as Product[]).length === 0) {
      toast.error("Không có sản phẩm nào được chọn");
      return;
    }

    if (paymentMethod === "VNPay") {
      await processOrder();
      return;
    }

    if (paymentMethod !== "Thanh toán khi nhận hàng (COD)") {
      setShowQRModal(true);
    } else {
      await processOrder();
    }
  };

  return {
    address,
    setAddress,
    provinces,
    districts,
    wards,
    selectedProvinceId,
    handleProvinceChange,
    selectedDistrictId,
    handleDistrictChange,
    selectedWardCode,
    handleWardChange,
    paymentMethod,
    setPaymentMethod,
    voucherCode,
    setVoucherCode,
    appliedVoucher,
    discountAmount,
    handleValidateVoucher,
    handleRemoveVoucher,
    isValidatingVoucher,
    finalAmount,
    displayTotalAmount,
    shippingFee,
    setShippingFee,
    handleCheckout,
    showQRModal,
    setShowQRModal,
    processOrder,
    selectedProducts,
    user,
    token,
  };
};
