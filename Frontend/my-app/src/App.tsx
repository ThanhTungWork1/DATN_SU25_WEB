import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import UserProfile from './pages/client/userProfile'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Routes>
        {/* Các route khác ở đây */}
        <Route path="/users/:id" element={<UserProfile />} />
    </Routes>
    </>
  )
}

export default App
