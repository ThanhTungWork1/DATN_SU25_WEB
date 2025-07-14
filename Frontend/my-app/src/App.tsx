// src/App.tsx

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// Import adminRoutes (đã được cấu hình để sử dụng AdminLayout)
import { adminRoutes } from "./routes/adminRoutes";
// import AdminLogin from "./pages/admin/AdminLogin"; 




export default function App() {
    return (
  
        <Routes>
            {adminRoutes} 
             {/* <Route path="/admin/login" element={<AdminLogin />} /> */}
            <Route path="/" element={<h1>Trang chủ Frontend</h1>} />
            <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />
        </Routes>
    );
}

