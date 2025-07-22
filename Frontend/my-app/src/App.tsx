import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClientRoute from "./routes/ClientRoute";
import AdminRoute from "./routes/AdminRoute";

function App() {
  return (
      <Routes>
        <Route path="/*" element={<ClientRoute />} />
        <Route path="/admin/*" element={<AdminRoute />} />
      </Routes>
  );
}

export default App;
