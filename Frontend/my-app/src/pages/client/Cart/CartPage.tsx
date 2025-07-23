import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  clearCart
} from "../../../store/cartSlice";
import { useNavigate } from "react-router-dom";
import { getCartItemsWithDetails, updateCartItem, removeCartItem } from "../../../api/ApiUrl"; // sửa path nếu cần

const CartPage = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ [key: number]: boolean }>({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Giả sử userId được lưu localStorage sau đăng nhập
  const userId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    if (userId) {
      getCartItemsWithDetails(userId).then((items) => setCartItems(items));
    }
  }, [userId]);

  const toggleSelectItem = (id: number) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedProducts = cartItems.filter((item) => selectedItems[item.id]);
  const totalAmount = selectedProducts.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Cập nhật số lượng sản phẩm
  const handleQuantityChange = async (id: number, quantity: number) => {
    if (quantity < 1) return;
    await updateCartItem(id, quantity);
    // Reload lại giỏ hàng
    if (userId) {
      getCartItemsWithDetails(userId).then((items) => setCartItems(items));
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = async (id: number) => {
    await removeCartItem(id);
    // Reload lại giỏ hàng
    if (userId) {
      getCartItemsWithDetails(userId).then((items) => setCartItems(items));
    }
  };

  return (
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
                <img
                  src={item.image}
                  alt={item.name}
                  className="img-thumbnail"
                  width={80}
                />
                <div className="ms-3 w-50">
                  <h5 className="fw-bold">{item.name}</h5>
                  <p className="text-danger fw-bold">{item.price.toLocaleString()} VND</p>
                  <p>Màu: {item.color} | Size: {item.size}</p>
                </div>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  className="form-control w-25 mx-2"
                  title="Số lượng"
                  placeholder="Số lượng"
                  onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                />
                <p className="fw-bold">
                  {(item.price * item.quantity).toLocaleString()} VND
                </p>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="btn btn-danger ms-3"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
          <div className="col-lg-4">
            <div className="p-4 bg-light rounded shadow">
              <h4 className="fw-bold">Tóm tắt đơn hàng</h4>
              <p className="fw-bold">
                Tổng tiền: <span className="text-danger">{totalAmount.toLocaleString()} VND</span>
              </p>
              <button
                className="btn btn-success w-100 my-2"
                onClick={() => navigate("/checkout", {
                  state: { selectedProducts, totalAmount }
                })}
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
  );
};

export default CartPage;