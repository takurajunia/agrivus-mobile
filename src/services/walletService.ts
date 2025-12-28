import axios from "axios";

const API_URL = "https://your-api-url.com/api";

export const fetchWallet = async (token: string) => {
  const response = await axios.get(`${API_URL}/wallet`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fundWallet = async (amount: number, token: string) => {
  const response = await axios.post(
    `${API_URL}/wallet/fund`,
    { amount },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
