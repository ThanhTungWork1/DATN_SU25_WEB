import { useCheckout } from "../../../hook/useCheckout";
import { Product, Province, District, Ward } from "../../../types/Checkout";

const CheckoutPage = () => {
  const {
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
    handleCheckout,
    selectedProducts,
  } = useCheckout();

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-dark mb-2">
            <i className="fas fa-credit-card text-success me-3"></i>
            Thanh toán đơn hàng
          </h1>
          <p className="text-muted fs-5">Hoàn tất đơn hàng của bạn</p>
        </div>

        <div className="row g-4">
          {/* Left Column */}
          <div className="col-lg-8">
            {/* Order Summary */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-box text-primary me-2"></i>
                  Đơn hàng của bạn ({selectedProducts.length} sản phẩm)
                </h5>
              </div>
              <div className="card-body p-0">
                {(selectedProducts as Product[]).map(
                  (item: Product, index: number) => (
                    <div
                      key={item.id}
                      className={`p-4 ${index !== (selectedProducts as Product[]).length - 1 ? "border-bottom" : ""}`}
                    >
                      <div className="row align-items-center">
                        <div className="col-auto">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="rounded-3 shadow-sm"
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                        <div className="col">
                          <h6 className="fw-bold mb-1">{item.name}</h6>
                          <div className="text-muted mb-2">
                            Số lượng: {item.quantity}
                          </div>
                          <div className="fw-bold text-danger">
                            {Math.round(item.price).toLocaleString("vi-VN")} VND
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="fw-bold fs-5 text-dark">
                            {Math.round(
                              item.price * item.quantity
                            ).toLocaleString("vi-VN")}{" "}
                            VND
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-map-marker-alt text-danger me-2"></i>
                  Địa chỉ giao hàng
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Tỉnh/Thành phố *
                    </label>
                    <select
                      className="form-select"
                      value={selectedProvinceId}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      {provinces.map((province: Province) => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Quận/Huyện *
                    </label>
                    <select
                      className="form-select"
                      value={selectedDistrictId}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      disabled={!selectedProvinceId}
                    >
                      <option value="">Chọn quận/huyện</option>
                      {districts.map((district: District) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Phường/Xã *
                    </label>
                    <select
                      className="form-select"
                      value={selectedWardCode}
                      onChange={(e) => handleWardChange(e.target.value)}
                      disabled={!selectedDistrictId}
                    >
                      <option value="">Chọn phường/xã</option>
                      {wards.map((ward: Ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Số nhà, tên đường *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập địa chỉ cụ thể"
                      value={address.street}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-credit-card text-success me-2"></i>
                  Phương thức thanh toán
                </h5>
              </div>
              <div className="card-body">
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="cod"
                    checked={paymentMethod === "Thanh toán khi nhận hàng (COD)"}
                    onChange={() =>
                      setPaymentMethod("Thanh toán khi nhận hàng (COD)")
                    }
                  />
                  <label className="form-check-label fw-semibold" htmlFor="cod">
                    <i className="fas fa-hand-holding-usd text-warning me-2"></i>
                    Thanh toán khi nhận hàng (COD)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="vnpay"
                    checked={paymentMethod === "VNPay"}
                    onChange={() => setPaymentMethod("VNPay")}
                  />
                  <label
                    className="form-check-label fw-semibold"
                    htmlFor="vnpay"
                  >
                    <i className="fas fa-credit-card text-success me-2"></i>
                    Thanh toán VNPay
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-lg-4">
            <div
              className="card shadow-sm border-0 sticky-top"
              style={{ top: "20px" }}
            >
              <div className="card-header bg-primary text-white py-3">
                <h5 className="mb-0 fw-bold">
                  <i className="fas fa-receipt me-2"></i>Tóm tắt đơn hàng
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <label className="form-label fw-semibold">Mã giảm giá</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập mã voucher"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      disabled={!!appliedVoucher}
                    />
                    <button
                      className="btn btn-outline-primary"
                      type="button"
                      onClick={handleValidateVoucher}
                      disabled={isValidatingVoucher || !!appliedVoucher}
                    >
                      {isValidatingVoucher ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        "Áp dụng"
                      )}
                    </button>
                  </div>
                  {appliedVoucher && (
                    <div className="mt-2 p-2 bg-success bg-opacity-10 rounded">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-success fw-semibold">
                          <i className="fas fa-check-circle me-1"></i>
                          {appliedVoucher.code}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={handleRemoveVoucher}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <span className="fw-semibold">
                    {displayTotalAmount.toLocaleString("vi-VN")} VND
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <span className="fw-semibold">
                    {shippingFee.toLocaleString("vi-VN")} VND
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Giảm giá:</span>
                    <span className="fw-semibold text-success">
                      -{discountAmount.toLocaleString("vi-VN")} VND
                    </span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <span className="fs-5 fw-bold">Tổng cộng:</span>
                  <span className="fs-4 fw-bold text-danger">
                    {finalAmount.toLocaleString("vi-VN")} VND
                  </span>
                </div>
                <button
                  className="btn btn-success w-100 py-3 fw-bold"
                  onClick={() => {
                    // 🔍 DEBUG: Log dữ liệu trước khi đặt hàng
                    console.log("🎯 === CLICK ĐẶT HÀNG NHAY ===");
                    console.log("🎯 selectedProducts:", selectedProducts);
                    console.log(
                      "🎯 selectedProducts length:",
                      selectedProducts?.length
                    );
                    console.log("🎯 displayTotalAmount:", displayTotalAmount);
                    console.log("🎯 shippingFee:", shippingFee);
                    console.log("🎯 discountAmount:", discountAmount);
                    console.log("🎯 finalAmount:", finalAmount);
                    console.log("🎯 paymentMethod:", paymentMethod);
                    console.log("🎯 address:", address);

                    // Gọi hàm handleCheckout
                    handleCheckout();
                  }}
                  disabled={(selectedProducts as Product[]).length === 0}
                >
                  <i className="fas fa-shopping-cart me-2"></i>
                  Đặt hàng ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
