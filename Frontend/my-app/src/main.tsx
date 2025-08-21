import { createRoot } from "react-dom/client";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./provider/CartProvider";
import { Provider } from "react-redux";
import { store } from "./store/store";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axiosInstance from "./utils/axiosInstance";

const queryClient = new QueryClient();

// Khởi tạo CSRF cookie từ Sanctum
axiosInstance
  .get("http://localhost:8000/sanctum/csrf-cookie")
  .catch((error) => {
    console.error("Could not fetch CSRF cookie", error);
  });

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </Provider>
);
