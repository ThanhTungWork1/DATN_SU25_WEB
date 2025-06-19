<<<<<<< HEAD
<<<<<<< HEAD
import { Route, Routes } from "react-router-dom";
import ProductDetail from "../pages/client/Detail/ProductDetail";
import { ListProduct } from "../pages/client/ProductsList/ListProduct";
import CartPage from "../pages/client/Cart/CartPage";
import CheckoutPage from "../pages/client/Cart/CheckoutPage";
import OrderHistory from "../pages/client/Oders/OrderHistory";  
import OrderDetail from "../pages/client/Oders/OrderDetail";     
import ResultProduct from "../pages/client/ResultProduct/ResultProduct";
import HomePage from "../pages/client/Home";
import UserProfile from "../pages/client/userProfile";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Header from "../components/Home/Header";
import Footer from "../components/Footer";

const ClientRoute = () => {
  return (

    <>
    <Header/>
      <Routes>
          <Route path='/' element={<HomePage/>}/>
        <Route path="/users/:id" element={<UserProfile />} />
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path="/products" element={<ListProduct />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/search" element={<ResultProduct />} />
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

