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
import OrderHistory from "../pages/client/Orders/OrderHistory";
import OrderDetail from "../pages/client/Orders/OrderDetail";
import UserProfile from "../pages/client/Home/UserProfile";
import UserLogin from "../pages/auth/userLogin";
import AdminLogin from "../pages/auth/adminLogin";
import RequireAuth from "./RequireAuth";
import Contact from "../pages/client/Contact/Contact";

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

        <Route element={<RequireAuth allowedRoles={["user"]} />}>
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/wishlist" element={<LikeProduct />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
      <Footer />
    </>
  );
};

export default ClientRoute;
