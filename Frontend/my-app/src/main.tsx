import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import ReactQueryProvider from "./provider/ClientProvideDetail.tsx";
import { CartProvider } from "./provider/CartProvider";
import { Provider } from "react-redux";
import { store } from "./store/store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
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
);
