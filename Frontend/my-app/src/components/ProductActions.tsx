import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 import useNavigate
import { FaShoppingCart } from "react-icons/fa";
import "../assets/styles/action.css";

type ProductActionsProps = {
  onAddToCart: (quantity: number) => void;
  onBuyNow?: () => void;
  maxQuantity: number;
  disabled?: boolean;
};

const ProductActions = ({
  onAddToCart,
  onBuyNow,
  maxQuantity,
  disabled = false,
}: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate(); // 👈 Khởi tạo navigate

  const increase = () =>
    setQuantity((q) => (q < maxQuantity ? q + 1 : maxQuantity));
  const decrease = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleBuyNow = () => {
    onAddToCart(quantity); // 👈 Thêm sản phẩm vào giỏ (nếu cần)
    navigate("/checkout", { state: { fromBuyNow: true } }); // 👈 Điều hướng sang trang thanh toán
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
        onClick={() => onAddToCart(quantity)}
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
