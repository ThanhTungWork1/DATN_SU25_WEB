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
    <Header/>
    <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path="/users/:id" element={<UserProfile />} />
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
    </Routes>
    <Footer/>
    </>
  );
}

export default App;
