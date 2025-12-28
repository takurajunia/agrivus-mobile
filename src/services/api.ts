import axios from "axios";

const API_URL = "https://your-api-url.com/api";

export default axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
