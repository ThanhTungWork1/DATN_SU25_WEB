import { Route, Routes } from "react-router-dom";
import ProductDetail from "../pages/client/Detail/ProductDetail";
import { ListProduct } from "../pages/client/ProductsList/ListProduct";
import ResultProduct from "../pages/client/ResultProduct/ResultProduct";

const clientRoute = () => {
  return (
    <>
      <Routes>
        <Route path="/products" element={<ListProduct />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/search" element={<ResultProduct />} />
      </Routes>
    </>
  );
};

export default clientRoute;
