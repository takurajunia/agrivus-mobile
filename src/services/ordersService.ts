import axios from "axios";

const API_URL = "https://your-api-url.com/api";

export const fetchOrders = async (token) => {
  const response = await axios.get(`${API_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createOrder = async (order, token) => {
  const response = await axios.post(`${API_URL}/orders`, order, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
