import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { WishlistProvider } from "./provider/WishlistContext";
import { Contact } from "./components/Contact";
import ClientRoute from "./routes/ClientRoute";
import AdminRoute from "./routes/AdminRoute";
// Thêm import AOS
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

function App() {
  useEffect(() => {
    AOS.init({ once: true });
  }, []);
  return (
    <WishlistProvider>
      <Routes>
        <Route path="/admin/*" element={<AdminRoute />} />
        <Route path="/*" element={<ClientRoute />} />
      </Routes>
      <Toaster position="top-right" richColors />
      <Contact />
    </WishlistProvider>
  );
}
