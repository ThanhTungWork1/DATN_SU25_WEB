import ClientRoute from "./routes/ClientRoute";
import { Toaster } from "sonner";
import './App.css'
import { Route, Routes } from 'react-router-dom'
import UserProfile from './pages/client/userProfile'

function App() {

  return (
    <>
    <Routes>
        {/* Các route khác ở đây */}
        <Route path="/users/:id" element={<UserProfile />} />
    </Routes>
    </>
  );
}

export default App;
