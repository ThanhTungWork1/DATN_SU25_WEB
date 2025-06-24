import { Route, Routes } from "react-router-dom";
import ProductDetail from "../pages/client/Detail/ProductDetail";
import { ListProduct } from "../pages/client/ProductsList/ListProduct";

const clientRoute = () => {
  return (
    <>
      <Routes>
         <Route path="/products" element={<ListProduct />} />
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
    </>
  );
};

export default clientRoute;
