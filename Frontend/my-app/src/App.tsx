import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { FavoriteProvider } from "./provider/FavoriteProvider";
import ClientRoute from "./routes/ClientRoute";
import AdminRoute from "./routes/AdminRoute";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./assets/styles/toast-custom.css";
import "./assets/styles/notification-fix.css";
import "./assets/styles/global-notification-fix.css";
import "./utils/debugAuth.js"; // Import debug script
import "./utils/testLogin.js"; // Import test script
import "./utils/testFullLogin.js"; // Import full test script

function App() {
  useEffect(() => {
    AOS.init({ once: true });
  }, []);
  return (
    <FavoriteProvider>
      <Routes>
        <Route path="/*" element={<ClientRoute />} />
        <Route path="/admin/*" element={<AdminRoute />} />
      </Routes>
      <Toaster
        position="top-right"
        theme="light"
        richColors
        closeButton
        duration={3000}
        offset={80}
        style={{
          top: "80px",
          right: "20px",
          zIndex: 9999,
        }}
      />
    </FavoriteProvider>
  );
}

export default App;
