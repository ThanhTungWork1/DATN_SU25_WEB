import axios from "axios";

export const getCart = () => {
  return axios.get("http://localhost:3000/cart");
};
