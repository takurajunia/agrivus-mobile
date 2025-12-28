import axios from "axios";

const API_URL = "https://your-api-url.com/api";

export const fetchChats = async (token) => {
  const response = await axios.get(`${API_URL}/chats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const sendMessage = async (chatId, message, token) => {
  const response = await axios.post(
    `${API_URL}/chats/${chatId}/messages`,
    message,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
