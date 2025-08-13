import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/client/Home/Home";
import Register from "../pages/auth/Register";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductDetail from "../pages/client/Detail/ProductDetail";
import { ListProduct } from "../pages/client/ProductsList/ListProduct";
import ResultProduct from "../pages/client/ResultProduct/ResultProduct";
import LikeProduct from "../pages/client/LikeProduct/LikeProduct";
import CartPage from "../pages/client/Cart/CartPage";
import CheckoutPage from "../pages/client/Cart/CheckoutPage";
import { ContactClient } from "../pages/client/Contact/Contact";
import { ContactFloating } from "../components/ContactFloating";
import UserProfile from "../pages/client/Home/UserProfile";
import UserLogin from "../pages/auth/userLogin";
import RequireAuth from "./RequireAuth";
import AdminLogin from "../pages/admin/AdminLogin";
// import Login from "../pages/auth/Login";
import OrderList from "../pages/client/Orders/OrderList";
// import OrderItem from "../pages/client/Orders/OrderItem";
import OrderSuccess from "../pages/checkout/OrderSuccess";
import VNPaySuccess from "../pages/payment/VNPaySuccess";
import VNPayFailed from "../pages/payment/VNPayFailed";

const ClientRoute = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<ListProduct />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/search" element={<ResultProduct />} />

        {/** Public payment callback routes (allow redirect without auth) **/}
        <Route path="/payment/vnpay/success" element={<VNPaySuccess />} />
        <Route path="/payment/vnpay/failure" element={<VNPayFailed />} />
        {/** Generic fallbacks if backend redirects to these paths **/}
        <Route path="/payment/success" element={<VNPaySuccess />} />
        <Route path="/payment/failed" element={<VNPayFailed />} />

        <Route element={<RequireAuth allowedRoles={["user"]} />}>
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderList />} />
          {/* <Route path="/orders/:id" element={<OrderItem />} /> */}
        </Route>

        <Route path="/wishlist" element={<LikeProduct />} />
        <Route path="/contact" element={<ContactClient />} />
        <Route path="/order-success" element={<OrderSuccess />} />
      </Routes>
      <Footer />
      <ContactFloating />
    </>
  );
};

export default ClientRoute;
