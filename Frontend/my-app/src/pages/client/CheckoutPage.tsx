import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CartItem, OrderPayload } from "../../types"
import { createOrder } from "../../api/order";
import CheckoutForm from "../../components/CheckoutForm";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (location.state) {
      setSelectedItems(location.state.selectedProducts || []);
      setTotalAmount(location.state.totalAmount || 0);
    }
  }, [location.state]);

  const handleOrderSubmit = async (order: OrderPayload) => {
    try {
      await createOrder(order);
      alert("Đặt hàng thành công!");
      navigate("/");
    } catch (err) {
      alert("Lỗi đặt hàng");
    }
  };

  return (
    <>
      <Header />
      <div className="container my-5">
        <h2 className="text-center">🧾 Thanh toán</h2>
        {selectedItems.length === 0 ? (
          <p className="text-center">Không có sản phẩm được chọn.</p>
        ) : (
          <>
            <ul className="list-group mb-3">
              {selectedItems.map((item) => (
                <li key={item.id} className="list-group-item d-flex justify-content-between">
                  <div>
                    <h6>{item.name}</h6>
                    <small>Số lượng: {item.quantity}</small>
                  </div>
                  <strong>{(item.price * item.quantity).toLocaleString()} VND</strong>
                </li>
              ))}
            </ul>
            <p className="fw-bold">Tổng tiền: {totalAmount.toLocaleString()} VND</p>
            <CheckoutForm selectedItems={selectedItems} totalAmount={totalAmount} onSubmit={handleOrderSubmit} />
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;
