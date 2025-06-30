import ClientRoute from "./routes/ClientRoute";
import { Toaster } from "sonner";
import './App.css'
import { Route, Routes } from 'react-router-dom'
import AdminRoute from './routes/AdminRoute'

function App() {

  return (
    <>
      <ClientRoute />
      <Toaster position="top-right" richColors />
    <AdminRoute/>
    </>
  );
}

export default App;
