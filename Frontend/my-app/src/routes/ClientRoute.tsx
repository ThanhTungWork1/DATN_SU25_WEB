import { Route, Routes } from "react-router-dom";
import ProductDetail from "../pages/client/Detail/ProductDetail";
import { ListProduct } from "../pages/client/ProductsList/ListProduct";
import CartPage from "../pages/client/Cart/CartPage";
import CheckoutPage from "../pages/client/Cart/CheckoutPage";
import OrderHistory from "../pages/client/Oders/OrderHistory";
import OrderDetail from "../pages/client/Oders/OrderDetail";
import ResultProduct from "../pages/client/ResultProduct/ResultProduct";

const ClientRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<ListProduct />} />
      <Route path="/products" element={<ListProduct />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/products/search" element={<ResultProduct />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/orders" element={<OrderHistory />} />
      <Route path="/orders/:id" element={<OrderDetail />} />
    </Routes>
  );
};

export default ClientRoute;
