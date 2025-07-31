import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { WishlistProvider } from "./provider/WishlistContext";
import ClientRoute from "./routes/ClientRoute";
import AdminRoute from "./routes/AdminRoute";
import { useEffect } from "react";
import AOS from "aos";
<<<<<<< HEAD
import "aos/dist/aos.css";

function App() {
  useEffect(() => {
    AOS.init({ once: true });
  }, []);
=======
// import "aos/dist/aos.css";

function App() {
  // useEffect(() => {
  //   AOS.init({ once: true });
  // }, []);
>>>>>>> origin/ThanhTung_profile_home_auth
  return (
    <WishlistProvider>
      <Routes>
        <Route path="/*" element={<ClientRoute />} />
        <Route path="/admin/*" element={<AdminRoute />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </WishlistProvider>
  );
}

export default App;
