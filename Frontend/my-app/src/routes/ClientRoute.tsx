import { Route, Routes } from "react-router-dom";
import ProductDetail from "../pages/client/Detail/ProductDetail";
import { ListProduct } from "../pages/client/ProductsList/ListProduct";
import ResultProduct from "../pages/client/ResultProduct/ResultProduct";
import HomePage from "../pages/client/Home";
import UserProfile from "../pages/client/userProfile";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Header from "../components/Home/Header";
import Footer from "../components/Footer";

const clientRoute = () => {
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
        
      </Routes>
    <Footer/>
    </>
  );
};

export default clientRoute;
