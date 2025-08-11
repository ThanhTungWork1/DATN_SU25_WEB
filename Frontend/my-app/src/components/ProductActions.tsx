import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../provider/CartProvider";
import { toast } from "sonner";
import "../assets/styles/action.css";

type ProductActionsProps = {
  productId: number;
  variantId?: number;
  maxQuantity: number;
  disabled?: boolean;
  productName?: string;
  productPrice?: number;
  productImage?: string;
};

const ProductActions = ({
  productId,
  variantId,
  maxQuantity,
  disabled = false,
  productName = "Sản phẩm",
  productPrice = 0,
  productImage = "",
}: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const increase = () =>
    setQuantity((q) => (q < maxQuantity ? q + 1 : maxQuantity));
  const decrease = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = async () => {
    try {
      // Giao cho CartProvider hiển thị toast (success/error)
      await addToCart({
        product_id: productId,
        variant_id: variantId || productId, // Fallback nếu không có variantId
        quantity: quantity,
        price: productPrice ?? 0,
      } as any);
    } catch (error) {
      // Nếu provider ném lỗi, chỉ log — tránh toast trùng lặp
      console.error("Error adding to cart:", error);
    }
  };

  const handleBuyNow = async () => {
    // Debug giá trước khi tạo object
    console.log('=== BUY NOW DEBUG ===');
    console.log('productPrice from props:', productPrice);
    console.log('productName from props:', productName);
    console.log('quantity:', quantity);
    
    // Tạo object sản phẩm để truyền đến checkout
    const selectedProduct = {
      id: productId,
      name: productName,
      price: productPrice, // Giữ nguyên giá gốc
      quantity: quantity,
      image: productImage,
      variant_id: variantId || productId
    };
    
    const totalAmount = (productPrice * quantity);
    
    console.log('selectedProduct:', selectedProduct);
    console.log('totalAmount:', totalAmount);
    
    // Chuyển thẳng đến checkout KHÔNG thêm vào giỏ hàng
    navigate("/checkout", { 
      state: { 
        selectedProducts: [selectedProduct],
        totalAmount: totalAmount,
        fromBuyNow: true 
      } 
    });
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
