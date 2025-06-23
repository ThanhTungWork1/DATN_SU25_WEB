import { BrowserRouter, Routes, Route } from "react-router-dom";
import CartPage from "./pages/client/CartPage";
import CheckoutPage from "./pages/client/CheckoutPage";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
