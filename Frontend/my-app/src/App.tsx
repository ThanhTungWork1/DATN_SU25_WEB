import ClientRoute from "./routes/ClientRoute";
import { Toaster } from "sonner";
import './App.css'
import { Route, Routes } from 'react-router-dom'
import UserProfile from './pages/client/userProfile'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import HomePage from './pages/client/Home'
import Header from './components/Home/Header'
import Footer from './components/Home/Footer'

function App() {

  return (
    <>
      <ClientRoute />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
