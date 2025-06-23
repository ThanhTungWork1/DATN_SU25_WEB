// src/api/order.ts
import axios from "axios";
import { OrderPayload } from "../types/index.ts"

export const createOrder = (payload: OrderPayload) => {
  return axios.post("http://localhost:3000/orders", payload);
};
