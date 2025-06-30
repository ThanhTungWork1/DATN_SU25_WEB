import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const CartSummary = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="text-end mt-3">
      <h4 className="fw-bold">Tổng tiền: {totalAmount.toLocaleString()} VND</h4>
    </div>
  );
};

export default CartSummary;
