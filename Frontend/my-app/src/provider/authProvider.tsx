import axiosInstance from "../api/axiosConfig";
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
  console.log("🌐 authProvider - Gọi API login với:", { resource, variables });

  try {
    const { data } = await axiosInstance.post<LoginResponse>(
      `/${resource}`,
      variables
    );
    console.log("🌐 authProvider - Response từ server:", data);
    return data;
  } catch (error: any) {
    console.error("❌ authProvider - Login API error:", error);
    console.error("❌ authProvider - Error response:", error.response);
    console.error("❌ authProvider - Error data:", error.response?.data);
    throw error;
  }
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
