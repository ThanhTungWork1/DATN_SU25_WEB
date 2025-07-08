import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { adminRoutes } from "./routes/adminRoutes";
import "antd/dist/reset.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {adminRoutes} {/* adminRoutes là một <Route> component */}
        <Route path="/" element={<h1>Trang chủ</h1>} />
        <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
