// src/provider/authProvider.ts
import axios from "../utils/axios";

type AuthParams = {
  resource: string;
  variables: any;
};

export const register = async ({ resource, variables }: AuthParams) => {
  const response = await axios.post(`/${resource}`, variables);
  return response.data;
};

export const login = async ({ resource, variables }: AuthParams) => {
  const response = await axios.post(`/${resource}`, variables);
  return response.data;
};
