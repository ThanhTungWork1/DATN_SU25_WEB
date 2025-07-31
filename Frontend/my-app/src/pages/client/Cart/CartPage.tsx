import { useForm } from "react-hook-form";
// import type { CartItem } from "../../../hook/useCart";
import useCart from "../../../hook/useCart";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeItem, clearCart } = useCart(token);

  const [selectedItems, setSelectedItems] = useState<{ [key: number]: boolean }>({});
  const { register, handleSubmit, setValue } = useForm();

  // Tự động chọn tất cả sản phẩm khi cartItems thay đổi
  useEffect(() => {
    const allSelected = cartItems.reduce((acc, item) => {
      acc[item.id] = true;
      return acc;
    }, {} as { [key: number]: boolean });
    setSelectedItems(allSelected);
  }, [cartItems]);

  const toggleSelectItem = (id: number) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onSubmit = (data: any) => {
    // Dữ liệu trả về dạng: { "qty-1": "2", "qty-2": "1" }
    Object.keys(data).forEach((key) => {
      const id = Number(key.replace("qty-", ""));
      const quantity = Number(data[key]);
      if (quantity > 0) updateQuantity(id, quantity);
    });
  };

  const selectedProducts = cartItems.filter((item) => selectedItems[item.id]);
  const totalAmount = selectedProducts.reduce(
    (total, item) => total + (item.price * 1000) * item.quantity,
    0
  );

  return (
    <div className="container my-5">
      <h2 className="fw-bold text-center">🛒 Giỏ hàng của bạn</h2>

      {cartItems.length === 0 ? (
        <p className="text-center text-muted">Giỏ hàng trống.</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
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
                    <p className="text-danger fw-bold">{(item.price * 1000).toLocaleString("vi-VN")} VND</p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    defaultValue={item.quantity}
                    className="form-control w-25 mx-2"
                    {...register(`qty-${item.id}`)}
                  />
                  <p className="fw-bold">{((item.price * 1000) * item.quantity).toLocaleString("vi-VN")} VND</p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="btn btn-danger ms-3"
                  >
                    Xóa
                  </button>
                </div>
              ))}
              <button type="submit" className="btn btn-primary mt-3">
                Cập nhật số lượng
              </button>
            </div>

            <div className="col-lg-4">
              <div className="p-4 bg-light rounded shadow">
                <h4 className="fw-bold">Tóm tắt đơn hàng</h4>
                <p className="fw-bold">
                  Tổng tiền:{" "}
                  <span className="text-danger">{totalAmount.toLocaleString()} VND</span>
                </p>

                <button
                  className="btn btn-success w-100 my-2"
                  type="button"
                  onClick={() =>
                    navigate("/checkout", {
                      state: { selectedProducts, totalAmount },
                    })
                  }
                  disabled={selectedProducts.length === 0}
                >
                  Tiến hành thanh toán
                </button>

                <button
                  className="btn btn-dark w-100"
                  type="button"
                  onClick={clearCart}
                  disabled={cartItems.length === 0}
                >
                  Xóa toàn bộ giỏ hàng
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CartPage;
