import React from "react";
import { createRoot } from "react-dom/client";
// import './index.css'
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import ReactQueryProvider from "./provider/ClientProvideDetail.tsx";
import { CartProvider } from "./provider/CartProvider";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";


createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ReactQueryProvider>
        <BrowserRouter>
          <CartProvider>
            <App />
          </CartProvider>
        </BrowserRouter>
      </ReactQueryProvider>
    </Provider>
  </React.StrictMode>
);

