import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCart from "../../../hook/useCart";
import "../../../assets/styles/responsive.css";
import CartItem from "../../../components/cart/CartItem"; // Import component CartItem
import { toast } from "sonner";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeItem, clearCart, fetchCart } =
    useCart("");

  useEffect(() => {
    if (cartItems.length > 0) {
    }
  }, [cartItems]);

  const [selectedItems, setSelectedItems] = useState<{
    [key: number]: boolean;
  }>({});

  // Tự động chọn tất cả sản phẩm khi cartItems thay đổi
  useEffect(() => {
    const allSelected = cartItems.reduce(
      (acc, item) => {
        acc[item.id] = true;
        return acc;
      },
      {} as { [key: number]: boolean }
    );
    setSelectedItems(allSelected);
  }, [cartItems]);

  // Đảm bảo đồng bộ lần đầu mở trang
  useEffect(() => {
    fetchCart?.();
  }, []);

  const toggleSelectItem = (id: number) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Thêm function để bỏ chọn tất cả
  const deselectAll = () => {
    setSelectedItems({});
  };

  // Thêm function để chọn tất cả
  const selectAll = () => {
    const allSelected = cartItems.reduce(
      (acc, item) => {
        acc[item.id] = true;
        return acc;
      },
      {} as { [key: number]: boolean }
    );
    setSelectedItems(allSelected);
  };

  const selectedProducts = cartItems.filter((item) => selectedItems[item.id]);
  const subtotalAmount = selectedProducts.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const totalAmount = subtotalAmount; // Không cộng phí vận chuyển nữa

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-dark mb-2">
            <i className="fas fa-shopping-cart text-primary me-3"></i>
            Giỏ hàng của bạn
          </h1>
          <p className="text-muted fs-5">Xem lại các sản phẩm bạn đã chọn</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-4">
              <i
                className="fas fa-shopping-cart text-muted"
                style={{ fontSize: "5rem" }}
              ></i>
            </div>
            <h3 className="text-muted mb-3">Giỏ hàng trống</h3>
            <p className="text-muted mb-4">
              Hãy thêm một số sản phẩm vào giỏ hàng của bạn
            </p>
            <button
              className="btn btn-primary btn-lg px-4 py-2"
              onClick={() => navigate("/products")}
            >
              <i className="fas fa-shopping-bag me-2"></i>
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {/* Danh sách sản phẩm */}
            <div className="col-lg-8">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-0 py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">
                      <i className="fas fa-list-ul text-primary me-2"></i>
                      Sản phẩm ({cartItems.length})
                    </h5>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={selectAll}
                        disabled={selectedProducts.length === cartItems.length}
                      >
                        <i className="fas fa-check-square me-1"></i>
                        Chọn tất cả
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={deselectAll}
                        disabled={selectedProducts.length === 0}
                      >
                        <i className="fas fa-square me-1"></i>
                        Bỏ chọn tất cả
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body p-0">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`d-flex align-items-center p-3 ${index !== cartItems.length - 1 ? "border-bottom" : ""}`}
                    >
                      <div className="form-check me-3">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`item-${item.id}`}
                          checked={selectedItems[item.id] || false}
                          onChange={() => toggleSelectItem(item.id)}
                          style={{ transform: "scale(1.2)" }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        {/* Sử dụng component CartItem đã được chuẩn hóa */}
                        <CartItem
                          item={item}
                          onUpdateQuantity={(id, quantity) =>
                            updateQuantity(id, quantity)
                          }
                          onRemove={(id) => removeItem(id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tóm tắt đơn hàng */}
            <div className="col-lg-4">
              <div
                className="card shadow-sm border-0 sticky-top"
                style={{ top: "20px" }}
              >
                <div className="card-header bg-primary text-white py-3">
                  <h5 className="mb-0 fw-bold">
                    <i className="fas fa-receipt me-2"></i>
                    Tóm tắt đơn hàng
                  </h5>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <span>Số sản phẩm đã chọn:</span>
                    <span className="fw-bold">{selectedProducts.length}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Tổng tiền sản phẩm:</span>
                    <span className="fw-bold">
                      {subtotalAmount.toLocaleString("vi-VN")} VND
                    </span>
                  </div>

                  <hr />
                  <div className="d-flex justify-content-between mb-4">
                    <span className="fs-5 fw-bold">Tổng cộng:</span>
                    <span className="fs-4 fw-bold text-danger">
                      {totalAmount.toLocaleString("vi-VN")} VND
                    </span>
                  </div>

                  <button
                    className="btn btn-success w-100 mb-3 py-2"
                    type="button"
                    onClick={() => {
                      // 🔧 FIX: Transform CartItem[] thành Product[] để match với useCheckout
                      console.log("🛒 === CART TO CHECKOUT DEBUG ===");
                      console.log(
                        "🛒 selectedProducts (CartItem[]):",
                        selectedProducts
                      );

                      const transformedProducts = selectedProducts.map(
                        (item) => {
                          // 🔍 DEBUG: Log chi tiết từng item trước khi transform
                          console.log("🛒 === ITEM DETAILS ===");
                          console.log("🛒 item:", item);
                          console.log(
                            "🛒 item.product_variant_id:",
                            item.product_variant_id
                          );
                          console.log(
                            "🛒 item.product_variant_id:",
                            item.product_variant_id
                          );
                          console.log(
                            "🛒 item.product_variant:",
                            item.product_variant
                          );
                          console.log("🛒 All item keys:", Object.keys(item));

                          // 🔍 DEBUG: Log ảnh để debug
                          console.log("🛒 === IMAGE DEBUG ===");
                          console.log("🛒 item.image:", item.image);
                          console.log(
                            "🛒 item.product_variant.image_url:",
                            item.product_variant?.image_url
                          );

                          const transformed = {
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            image:
                              item.product_variant?.image_url || item.image, // 🔧 FIX: Ưu tiên ảnh từ variant
                            variant_id:
                              item.product_variant?.id ||
                              item.product_variant_id, // 🔧 FIX: Lấy từ product_variant.id
                          };
                          console.log("🛒 Transform item:", {
                            original: {
                              id: item.id,
                              name: item.name,
                              product_variant_id: item.product_variant_id,
                              product_variant_id_actual:
                                item.product_variant?.id,
                            },
                            transformed: {
                              id: transformed.id,
                              name: transformed.name,
                              variant_id: transformed.variant_id,
                              price: transformed.price,
                              quantity: transformed.quantity,
                            },
                          });

                          // 🔍 DEBUG: Log rõ ràng variant_id cuối cùng
                          console.log(
                            "🛒 FINAL VARIANT_ID:",
                            transformed.variant_id
                          );
                          console.log("🛒 FINAL PRICE:", transformed.price);
                          return transformed;
                        }
                      );

                      console.log(
                        "🛒 Final transformedProducts:",
                        transformedProducts
                      );
                      console.log("🛒 totalAmount:", subtotalAmount);

                      navigate("/checkout", {
                        state: {
                          selectedProducts: transformedProducts,
                          totalAmount: subtotalAmount,
                        },
                      });
                    }}
                    disabled={selectedProducts.length === 0}
                  >
                    <i className="fas fa-credit-card me-2"></i>
                    Tiến hành thanh toán
                  </button>

                  <button
                    className="btn btn-outline-danger w-100"
                    type="button"
                    onClick={() => {
                      toast.promise(clearCart(), {
                        loading: "Đang xóa giỏ hàng...",
                        success: "Đã xóa toàn bộ giỏ hàng thành công!",
                        error: "Có lỗi xảy ra khi xóa giỏ hàng",
                      });
                    }}
                    disabled={cartItems.length === 0}
                  >
                    <i className="fas fa-trash me-2"></i>
                    Xóa toàn bộ giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
