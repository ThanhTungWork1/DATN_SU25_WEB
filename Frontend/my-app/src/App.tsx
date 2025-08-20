import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { WishlistProvider } from "./provider/WishlistContext";
import ClientRoute from "./routes/ClientRoute";
import AdminRoute from "./routes/AdminRoute";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./utils/testAuth"; // Import để có thể sử dụng testAuth() trong console
import "./utils/testAdminLogin"; // Import để có thể sử dụng testAdminLogin() trong console

function App() {
  useEffect(() => {
    AOS.init({ once: true });
  }, []);
  return (
    <WishlistProvider>
      <Routes>
        <Route path="/*" element={<ClientRoute />} />
        <Route path="/admin/*" element={<AdminRoute />} />
      </Routes>
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
        style={{ zIndex: 9999 }}
      />
    </WishlistProvider>
  );
}

export default App;
