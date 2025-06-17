import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { adminRoutes } from "./routes/adminRoutes";

function App() {
  return (
   <BrowserRouter>
  <div>
    <nav>
      <a href="/admin/products">Sản phẩm</a> | 
    </nav>
    <Routes>
      {adminRoutes}
      <Route path="/" element={<h1>Trang chủ</h1>} />
    </Routes>
  </div>
</BrowserRouter>

  );
}

export default App;