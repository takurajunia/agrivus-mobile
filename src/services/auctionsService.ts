import axios from "axios";

const API_URL = "https://your-api-url.com/api";

export const fetchAuctions = async () => {
  const response = await axios.get(`${API_URL}/auctions`);
  return response.data;
};

export const placeBid = async (auctionId, bid, token) => {
  const response = await axios.post(
    `${API_URL}/auctions/${auctionId}/bid`,
    bid,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
