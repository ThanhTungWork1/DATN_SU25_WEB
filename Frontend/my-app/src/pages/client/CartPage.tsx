import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { removeFromCart, updateQuantity, clearCart } from "../../store/cartSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const CartPage = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<{ [key: number]: boolean }>({});

  const toggleSelectItem = (id: number) => {
    setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedProducts = cartItems.filter(i => selectedItems[i.id]);
  const totalAmount = selectedProducts.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <>
      <Header />
      <div className="container my-5">
        <h2 className="text-center">🛒 Giỏ hàng</h2>
        {cartItems.length === 0 ? (
          <p className="text-center">Giỏ hàng trống.</p>
        ) : (
          <div className="row">
            <div className="col-lg-8">
              {cartItems.map(item => (
                <div key={item.id} className="d-flex align-items-center border-bottom py-3">
                  <input type="checkbox" className="form-check-input me-3" checked={selectedItems[item.id] || false} onChange={() => toggleSelectItem(item.id)} />
                  <img src={item.image} alt={item.name} width={80} />
                  <div className="ms-3 w-50">
                    <h5>{item.name}</h5>
                    <p className="text-danger">{item.price.toLocaleString()} VND</p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    className="form-control w-25 mx-2"
                    onChange={(e) => dispatch(updateQuantity({ id: item.id, quantity: Number(e.target.value) }))}
                  />
                  <p>{(item.price * item.quantity).toLocaleString()} VND</p>
                  <button className="btn btn-danger ms-3" onClick={() => dispatch(removeFromCart(item.id))}>Xóa</button>
                </div>
              ))}
            </div>
            <div className="col-lg-4">
              <div className="p-4 bg-light rounded shadow">
                <h4>Tóm tắt đơn hàng</h4>
                <p className="fw-bold">Tổng tiền: <span className="text-danger">{totalAmount.toLocaleString()} VND</span></p>
                <button
                  className="btn btn-success w-100 my-2"
                  disabled={selectedProducts.length === 0}
                  onClick={() => navigate("/checkout", { state: { selectedProducts, totalAmount } })}
                >Tiến hành thanh toán</button>
                <button className="btn btn-dark w-100" onClick={() => dispatch(clearCart())}>Xóa toàn bộ giỏ hàng</button>
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
