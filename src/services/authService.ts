import axios from "axios";

const API_URL = "https://your-api-url.com/api";

export const login = async (credentials: any) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data;
};

export const register = async (data: any) => {
  const response = await axios.post(`${API_URL}/auth/register`, data);
  return response.data;
};

export const fetchUser = async (token: string) => {
  const response = await axios.get(`${API_URL}/auth/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
