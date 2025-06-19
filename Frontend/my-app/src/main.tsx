import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import ReactQueryProvider from './provider/ClientProvideDetail.tsx';
import { CartProvider } from './provider/CartProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReactQueryProvider>
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    </ReactQueryProvider>
  </StrictMode>,
)
