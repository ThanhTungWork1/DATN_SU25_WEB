import { useDispatch } from "react-redux";
import { updateQuantity, removeFromCart } from "../../store/cartSlice";

interface CartItemProps {
  item: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  };
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const dispatch = useDispatch();

  return (
    <div className="d-flex align-items-center border-bottom py-2">
      <img src={item.image} alt={item.name} className="img-thumbnail" width={80} />
      <div className="ms-3">
        <h5>{item.name}</h5>
        <p>{item.price.toLocaleString()} VND</p>
      </div>
      <input
        type="number"
        min="1"
        value={item.quantity}
        className="form-control w-25 mx-2"
        onChange={(e) => {
          const newQuantity = Number(e.target.value);
          if (newQuantity > 0) {
            dispatch(updateQuantity({ id: item.id, quantity: newQuantity }));
          }
        }}
      />
      <p className="fw-bold">{(item.price * item.quantity).toLocaleString()} VND</p>
      <button onClick={() => dispatch(removeFromCart(item.id))} className="btn btn-danger ms-3">
        Xóa
      </button>
    </div>
  );
};

export default CartItem;
