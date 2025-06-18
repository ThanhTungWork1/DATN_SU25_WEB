<<<<<<< HEAD
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import ReactQueryProvider from "./provider/ClientProvideDetail.tsx";
import { CartProvider } from "./provider/CartProvider";
import { Provider } from "react-redux";
import { store } from "./store/store";
=======
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Tạo một QueryClient instance
const queryClient = new QueryClient();
>>>>>>> 01e18de4 ((admin): thêm chức năng hiển thị người dùng , chỉnh sửa người dùng, thêm người dùng, tìm kiếm người dùng)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
<<<<<<< HEAD
    <Provider store={store}>
      <ReactQueryProvider>
        <BrowserRouter>
          <CartProvider>
            <App />
          </CartProvider>
        </BrowserRouter>
      </ReactQueryProvider>
    </Provider>
  </StrictMode>
=======
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
>>>>>>> 01e18de4 ((admin): thêm chức năng hiển thị người dùng , chỉnh sửa người dùng, thêm người dùng, tìm kiếm người dùng)
);
