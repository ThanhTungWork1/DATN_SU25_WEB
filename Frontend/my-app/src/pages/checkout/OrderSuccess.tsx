import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OrderSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    orderId,
    address,
    totalAmount,
    paymentMethod,
    createdAt,
    items,
    customerName,
    customerPhone,
    voucherCode,
    discountAmount
  } = state || {};

  if (!orderId) {
    return (
      <div className="text-center mt-5">
        <h2>Không có thông tin đơn hàng.</h2>
        <button onClick={() => navigate("/")} className="btn btn-primary mt-3">
          Quay về Trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="container my-5 text-center">
      <h2 className="text-success fw-bold">🎉 Đơn hàng của bạn đã được đặt thành công!</h2>
      <p className="mt-4">Cảm ơn bạn đã mua hàng tại <b>StrideX</b>.</p>

      <div className="border p-4 mt-4 text-start mx-auto" style={{ maxWidth: 600 }}>
        <h4 className="fw-bold">Thông tin đơn hàng</h4>
        <p><b>Mã đơn hàng:</b> #{orderId}</p>
        <p><b>Thời gian:</b> {new Date(createdAt).toLocaleString()}</p>
        <p><b>Khách hàng:</b> {customerName}</p>
        <p><b>Số điện thoại:</b> {customerPhone}</p>
        <p><b>Địa chỉ:</b> {`${address.street}, ${address.ward}, ${address.district}, ${address.province}`}</p>
        <p><b>Thanh toán:</b> {paymentMethod}</p>
        {voucherCode && (
          <p><b>Mã giảm giá:</b> {voucherCode} <span className="text-success">(-{discountAmount?.toLocaleString()} VND)</span></p>
        )}
        
        {items && items.length > 0 && (
          <div className="mt-3">
            <h5 className="fw-bold">Sản phẩm đã đặt:</h5>
            {items.map((item, index) => (
              <div key={index} className="border-bottom py-2">
                <p className="mb-1"><b>{item.name}</b></p>
                <p className="mb-1">Số lượng: {item.quantity}</p>
                <p className="text-danger">{(item.price * 1000).toLocaleString()} VND</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-3 pt-3 border-top">
          <h5 className="fw-bold text-danger">
            Tổng tiền: {totalAmount.toLocaleString()} VND
          </h5>
        </div>
      </div>

      <div className="mt-4">
        <button className="btn btn-outline-primary me-3" onClick={() => navigate("/")}>
          Quay về Trang chủ
        </button>
        <button className="btn btn-outline-secondary me-3" onClick={() => navigate("/orders")}>
          Xem Đơn Hàng
        </button>
        <button className="btn btn-outline-success" onClick={() => window.print()}>
          In Đơn Hàng
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
