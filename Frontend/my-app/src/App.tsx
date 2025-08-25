import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { WishlistProvider } from "./provider/WishlistContext";
import ClientRoute from "./routes/ClientRoute";
import AdminRoute from "./routes/AdminRoute";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./assets/styles/toast-custom.css";
import "./utils/debugAuth.js"; // Import debug script
import "./utils/testLogin.js"; // Import test script
import "./utils/testFullLogin.js"; // Import full test script

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
      <Toaster position="top-right" theme="light" richColors closeButton />
    </WishlistProvider>
  );
}

export default App;
