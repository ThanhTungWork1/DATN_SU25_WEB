import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import "../assets/styles/action.css";

type ProductActionsProps = {
  maxQuantity: number;
  disabled?: boolean;
  onAddToCart: (quantity: number) => void;
  onBuyNow: (quantity: number) => void;
};

const ProductActions = ({
  maxQuantity,
  disabled = false,
  onAddToCart,
  onBuyNow,
}: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);

  const increase = () =>
    setQuantity((q) => (q < maxQuantity ? q + 1 : maxQuantity));
  const decrease = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    onAddToCart(quantity);
  };

  const handleBuyNow = () => {
    onBuyNow(quantity);
  };

  return (
    <div className="mt-3 d-flex align-items-center gap-3 flex-wrap">
      <div className="quantity-control">
        <button onClick={decrease} className="quantity-btn" type="button">
          −
        </button>
        <input
          type="number"
          min={1}
          max={maxQuantity}
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val)) {
              setQuantity(Math.min(Math.max(val, 1), maxQuantity));
            }
          }}
          className="quantity-input"
        />
        <button onClick={increase} className="quantity-btn" type="button">
          +
        </button>
      </div>

      <button
        className={`btn-add-cart d-flex align-items-center${disabled ? " disabled" : ""}`}
        onClick={handleAddToCart}
        disabled={disabled}
      >
        <FaShoppingCart className="me-1" /> Thêm
      </button>

      <button
        className={`btn-buy-now${disabled ? " disabled" : ""}`}
        onClick={handleBuyNow}
        disabled={disabled}
      >
        Mua ngay
      </button>
    </div>
  );
};

export default ProductActions;
