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
import RequireAuth from "./RequireAuth";
import OrderList from "../pages/client/Orders/OrderList";
import OrderSuccess from "../pages/checkout/OrderSuccess";
import LoginPage from "../pages/auth/Login";

const ClientRoute = () => {
  return (
    <Routes>
      {/* Các route KHÔNG có Navbar/Footer */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />

      {/* Các route CÓ Navbar/Footer */}
      <Route
        path="*"
        element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ListProduct />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/search" element={<ResultProduct />} />
              <Route element={<RequireAuth allowedRoles={["user"]} />}>
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrderList />} />
              </Route>
              <Route path="/wishlist" element={<LikeProduct />} />
              <Route path="/contact" element={<ContactClient />} />
              <Route path="/order-success" element={<OrderSuccess />} />
            </Routes>
            <Footer />
            <ContactFloating />
          </>
        }
      />
    </Routes>
  );
};

export default ClientRoute;
