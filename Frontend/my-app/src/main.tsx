<<<<<<< HEAD
<<<<<<< HEAD
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </QueryClientProvider>
);
=======
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
=======
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
>>>>>>> a8244187 (giao dien list sp)
// import './index.css'
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import ReactQueryProvider from "./provider/ClientProvideDetail.tsx";
import { CartProvider } from "./provider/CartProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReactQueryProvider>
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    </ReactQueryProvider>
  </StrictMode>,
<<<<<<< HEAD
)
>>>>>>> 6a994c6e (giao dien detail)
=======
);
>>>>>>> a8244187 (giao dien list sp)
