import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

// 👉 Export đúng kiểu
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
