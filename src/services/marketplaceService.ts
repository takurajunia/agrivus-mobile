import axios from "axios";

const API_URL = "https://your-api-url.com/api";

export const fetchListings = async () => {
  const response = await axios.get(`${API_URL}/listings`);
  return response.data;
};

export const createListing = async (listing, token) => {
  const response = await axios.post(`${API_URL}/listings`, listing, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
