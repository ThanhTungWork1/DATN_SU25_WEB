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
    showQRModal,
    setShowQRModal,
    processOrder,
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
                            src={item.image || "https://via.placeholder.com/80"}
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
                            {(item.price * 1000).toLocaleString("vi-VN")} VND
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="fw-bold fs-5 text-dark">
                            {(item.price * 1000 * item.quantity).toLocaleString(
                              "vi-VN"
                            )}{" "}
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
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="bank"
                    checked={paymentMethod === "Chuyển khoản ngân hàng"}
                    onChange={() => setPaymentMethod("Chuyển khoản ngân hàng")}
                  />
                  <label
                    className="form-check-label fw-semibold"
                    htmlFor="bank"
                  >
                    <i className="fas fa-university text-primary me-2"></i>
                    Chuyển khoản ngân hàng
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="ewallet"
                    checked={paymentMethod === "Ví điện tử (Momo/ZaloPay)"}
                    onChange={() =>
                      setPaymentMethod("Ví điện tử (Momo/ZaloPay)")
                    }
                  />
                  <label
                    className="form-check-label fw-semibold"
                    htmlFor="ewallet"
                  >
                    <i className="fas fa-mobile-alt text-info me-2"></i>Ví điện
                    tử (Momo/ZaloPay)
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
                  onClick={handleCheckout}
                  disabled={(selectedProducts as Product[]).length === 0}
                >
                  <i className="fas fa-shopping-cart me-2"></i>
                  Đặt hàng ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QR Modal */}
        {showQRModal && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className="fas fa-qrcode me-2"></i>Thanh toán{" "}
                    {paymentMethod}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowQRModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 text-center">
                      <h6 className="fw-bold mb-3">Quét mã QR để thanh toán</h6>
                      {paymentMethod === "Chuyển khoản ngân hàng" ? (
                        <div>
                          <img
                            src={`https://img.vietqr.io/image/970422-0686809012005-compact2.jpg?amount=${finalAmount}&addInfo=Thanh%20toan%20don%20hang%20${Date.now()}&accountName=LE%20KHAI%20HOAN`}
                            alt="QR Chuyển khoản MB Bank"
                            className="img-fluid border rounded"
                            style={{ maxWidth: "280px" }}
                          />
                          <div className="mt-3 card bg-light">
                            <div className="card-body p-3">
                              <div className="row text-start">
                                <div className="col-6">
                                  <strong>Ngân hàng:</strong>
                                </div>
                                <div className="col-6">MB Bank</div>
                                <div className="col-6">
                                  <strong>Số TK:</strong>
                                </div>
                                <div className="col-6">0686809012005</div>
                                <div className="col-6">
                                  <strong>Chủ TK:</strong>
                                </div>
                                <div className="col-6">LE KHAI HOAN</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <img
                            src={`https://momosv3.apimienphi.com/api/QRCode?phone=0686809012005&amount=${finalAmount}&note=Thanh%20toan%20don%20hang%20${Date.now()}`}
                            alt="QR Momo"
                            className="img-fluid border rounded"
                            style={{ maxWidth: "280px" }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://via.placeholder.com/280x280/28a745/ffffff?text=MOMO+QR";
                            }}
                          />
                          <div className="mt-3 card bg-light">
                            <div className="card-body p-3">
                              <div className="row text-start">
                                <div className="col-6">
                                  <strong>Ví Momo:</strong>
                                </div>
                                <div className="col-6">0686809012005</div>
                                <div className="col-6">
                                  <strong>Tên:</strong>
                                </div>
                                <div className="col-6">LE KHAI HOAN</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-3">Thông tin thanh toán</h6>
                      <div className="card border-primary">
                        <div className="card-body">
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
                          <div className="d-flex justify-content-between mb-3">
                            <span className="fs-5 fw-bold">
                              Tổng thanh toán:
                            </span>
                            <span className="fs-4 fw-bold text-danger">
                              {finalAmount.toLocaleString("vi-VN")} VND
                            </span>
                          </div>
                          <div className="alert alert-info">
                            <i className="fas fa-info-circle me-2"></i>
                            <strong>Nội dung chuyển khoản:</strong>
                            <br />
                            Thanh toan don hang {Date.now()}
                          </div>
                          <div className="alert alert-warning">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            Vui lòng chuyển khoản{" "}
                            <strong>chính xác số tiền</strong> và{" "}
                            <strong>nội dung</strong> để đơn hàng được xử lý tự
                            động.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowQRModal(false)}
                  >
                    <i className="fas fa-times me-2"></i>Hủy
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setShowQRModal(false);
                      processOrder();
                    }}
                  >
                    <i className="fas fa-check me-2"></i>Đã thanh toán - Hoàn
                    tất đơn hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
