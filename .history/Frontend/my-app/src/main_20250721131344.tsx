<<<<<<< HEAD
=======
import { StrictMode } from "react";
>>>>>>> origin/ThanhTung_profile_home_auth
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
<<<<<<< HEAD
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ReactQueryProvider>
      <QueryClientProvider client={queryClient}>
=======

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ReactQueryProvider>
>>>>>>> origin/ThanhTung_profile_home_auth
        <BrowserRouter>
          <CartProvider>
            <App />
          </CartProvider>
        </BrowserRouter>
<<<<<<< HEAD
      </QueryClientProvider>
    </ReactQueryProvider>
  </Provider>
);
=======
      </ReactQueryProvider>
    </Provider>
  </StrictMode>
);
>>>>>>> origin/ThanhTung_profile_home_auth
