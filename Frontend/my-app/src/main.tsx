// src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// Thêm import BrowserRouter
import { BrowserRouter } from 'react-router-dom' 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Bọc component App bằng BrowserRouter ở đây */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)