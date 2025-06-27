import { Route, Routes } from "react-router-dom";
import ProductDetail from "../pages/client/Detail/ProductDetail";
import { ListProduct } from "../pages/client/ProductsList/ListProduct";
import CartPage from "../pages/client/Cart/CartPage";
import CheckoutPage from "../pages/client/Cart/CheckoutPage";
import OrderHistory from "../pages/client/Orders/OrderHistory";
import OrderDetail from "../pages/client/Orders/OrderDetail";
import ResultProduct from "../pages/client/ResultProduct/ResultProduct";
import HomePage from "../pages/client/Home";
// import UserProfile from "../pages/client/UserProfile";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import '../assets/styles/style.css'
import LikeProduct from "../pages/client/LikeProduct/LikeProduct";
import UserProfile from "../pages/client/userProfile";


const ClientRoute = () => {
  return (

    <>
    <Navbar/>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path="/users/:id" element={<UserProfile />} />
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path="/products" element={<ListProduct />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/search" element={<ResultProduct />} />
        <Route path="/wishlist" element={<LikeProduct />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
      </Routes>
    <Footer/>
    </>
  );
};


export default ClientRoute;

