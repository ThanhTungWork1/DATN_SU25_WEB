import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { WishlistProvider } from "./provider/WishlistContext";
import ClientRoute from "./routes/ClientRoute";
import AdminRoute from "./routes/AdminRoute";
import { useEffect } from "react";


function App() {
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
