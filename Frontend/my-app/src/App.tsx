import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { WishlistProvider } from "./provider/WishlistContext";
import { Contact } from "./components/Contact";
import ClientRoute from "./routes/ClientRoute";
import AdminRoute from "./routes/AdminRoute";

function App() {
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

export default App;
