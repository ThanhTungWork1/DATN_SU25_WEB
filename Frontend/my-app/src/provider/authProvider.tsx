import axiosInstance from "../utils/axios";
// dùng đúng axiosInstance từ utils/axios.ts
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

export const login = async ({
  resource,
  variables,
}: AuthParams): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post<LoginResponse>(
    `/${resource}`,
    variables
  );
  return data;
};

export const register = async ({
  resource,
  variables,
}: AuthParams): Promise<LoginResponse> => {
  try {
    const { data } = await axiosInstance.post<LoginResponse>(
      `/${resource}`,
      variables
    );
    return data;
  } catch (error: any) {
    console.error(
      "❌ Register API error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
