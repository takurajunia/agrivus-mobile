import axios from "axios";

const API_URL = "https://your-api-url.com/api";

export const fetchNotifications = async (token) => {
  const response = await axios.get(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
