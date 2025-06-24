import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store/store";
import { removeFromCart, updateQuantity, clearCart } from "../../store/cartSlice";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const CartPage = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State lưu sản phẩm được chọn
  const [selectedItems, setSelectedItems] = useState<{ [key: number]: boolean }>({});

  // Chọn/Bỏ chọn sản phẩm
  const toggleSelectItem = (id: number) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Tính tổng tiền của sản phẩm được chọn
  const selectedProducts = cartItems.filter((item) => selectedItems[item.id]);
  const totalAmount = selectedProducts.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <>
      <Header />
      <div className="container my-5">
        <h2 className="fw-bold text-center">🛒 Giỏ hàng của bạn</h2>

        {cartItems.length === 0 ? (
          <p className="text-center text-muted">Giỏ hàng trống.</p>
        ) : (
          <div className="row">
            <div className="col-lg-8">
              {cartItems.map((item) => (
                <div key={item.id} className="d-flex align-items-center border-bottom py-3">
                  <input
                    type="checkbox"
                    className="form-check-input me-3"
                    checked={selectedItems[item.id] || false}
                    onChange={() => toggleSelectItem(item.id)}
                  />
                  <img src={item.image} alt={item.name} className="img-thumbnail" width={80} />
                  <div className="ms-3 w-50">
                    <h5 className="fw-bold">{item.name}</h5>
                    <p className="text-danger fw-bold">{item.price.toLocaleString()} VND</p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    className="form-control w-25 mx-2"
                    onChange={(e) => dispatch(updateQuantity({ id: item.id, quantity: Number(e.target.value) }))}
                  />
                  <p className="fw-bold">{(item.price * item.quantity).toLocaleString()} VND</p>
                  <button onClick={() => dispatch(removeFromCart(item.id))} className="btn btn-danger ms-3">
                    Xóa
                  </button>
                </div>
              ))}
            </div>

            {/* Cột Tổng Tiền & Thanh Toán */}
            <div className="col-lg-4">
              <div className="p-4 bg-light rounded shadow">
                <h4 className="fw-bold">Tóm tắt đơn hàng</h4>
                <p className="fw-bold">Tổng tiền: <span className="text-danger">{totalAmount.toLocaleString()} VND</span></p>
                
                <button 
                  className="btn btn-success w-100 my-2" 
                  onClick={() => navigate("/checkout", { state: { selectedProducts, totalAmount } })}
                  disabled={selectedProducts.length === 0}
                >
                  Tiến hành thanh toán
                </button>

                <button 
                  className="btn btn-dark w-100" 
                  onClick={() => dispatch(clearCart())}
                  disabled={cartItems.length === 0}
                >
                  Xóa toàn bộ giỏ hàng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
