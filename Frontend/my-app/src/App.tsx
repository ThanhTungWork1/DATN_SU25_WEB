<<<<<<< HEAD
import { Toaster } from "sonner";
import ClientRoute from "./routes/ClientRoute";
import { WishlistProvider } from "./provider/WishlistContext";

function App() {
=======
import { useRoutes } from 'react-router-dom';
import './App.css'
import AdminRoute from './routes/AdminRoute';

function App() {
  const routes = useRoutes(AdminRoute);

  return <>{routes}</>;

>>>>>>> 01e18de4 ((admin): thêm chức năng hiển thị người dùng , chỉnh sửa người dùng, thêm người dùng, tìm kiếm người dùng)
  return (
    <WishlistProvider>
      <ClientRoute />
      <Toaster position="top-right" richColors />
    </WishlistProvider>
  );
}

export default App;
