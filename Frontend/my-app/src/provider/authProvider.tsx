import axios from "../utils/axios";
import type { IUser } from "../types/users";

type AuthParams = {
  resource: string;
  variables: {
    login: string;
    password: string;
  };
};

type LoginResponse = {
  token: string;
  user: IUser;
};

export const login = async ({ resource, variables }: AuthParams): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`/${resource}`, variables);
    return response.data;
  } catch (error: any) {
    console.error("❌ Login API error:", error.response?.data || error.message);
    throw error;
  }
};
 // ✅ đóng hàm login ở đây

export const register = async ({ resource, variables }: AuthParams): Promise<AuthParams> => {
  const response = await axios.post<AuthParams>(`/${resource}`, variables);
  return response.data;
};
