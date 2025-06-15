<<<<<<< HEAD
import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import "../assets/styles/detailProduct.css";

type ProductActionsProps = {
  onAddToCart: (quantity: number) => void;
  onBuyNow?: () => void;
  maxQuantity: number;
};

const ProductActions = ({ onAddToCart, maxQuantity }: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);

  const increase = () =>
    setQuantity((q) => (q < maxQuantity ? q + 1 : maxQuantity));
  const decrease = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  return (
    <div className="mt-3 d-flex align-items-center gap-3 flex-wrap">
      {/* Bộ đếm số lượng */}
      <div className="d-flex align-items-center border rounded px-2">
        <button onClick={decrease} className="btn-quantity" type="button">
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
          className="form-control form-control-sm text-center border-0"
          style={{ width: 60 }}
        />
        <button onClick={increase} className="btn-quantity" type="button">
          +
        </button>
      </div>

      {/* Nút thêm giỏ hàng */}
      <button className="btn-add-cart" onClick={() => onAddToCart(quantity)}>
        <FaShoppingCart className="me-1" /> Thêm
      </button>

      {/* Nút mua ngay */}
      <button className="btn-buy-now">Mua ngay</button>
    </div>
  );
=======


const ProductActions = () => {
    return (
        <>
            <div className="input-group mb-3" style={{ width: '150px' }}>
                <button className="btn btn-outline-secondary">-</button>
                <input type="text" className="form-control text-center" defaultValue="1" />
                <button className="btn btn-outline-secondary">+</button>
            </div>

            <div className="d-flex gap-2">
                <button className="btn btn-warning text-white">Thêm giỏ hàng</button>
                <button className="btn btn-outline-secondary">+ Compare</button>
            </div>
        </>
    );
>>>>>>> 6a994c6e (giao dien detail)
};

export default ProductActions;
