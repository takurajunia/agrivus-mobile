import api from "./api";
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from "../types";

export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", credentials);
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", data);
  return response.data;
};

export const fetchUser = async (): Promise<User> => {
  const response = await api.get<{ success: boolean; data: User }>(
    "/auth/user"
  );
  return response.data.data;
};

export const logout = async (): Promise<void> => {
  // Call logout endpoint if your backend has one
  try {
    await api.post("/auth/logout");
  } catch (error) {
    // Ignore logout endpoint errors
  }
};
