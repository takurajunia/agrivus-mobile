import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// For development, you can use your local IP address
// Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find your IP
// For production, use your deployed backend URL
const API_BASE_URL = __DEV__
  ? "http://192.168.1.100:5000" // Replace with your computer's IP address
  : "https://your-production-api.com"; // Replace with production URL

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      // You might want to navigate to login screen here
      // This depends on your navigation setup
    }
    return Promise.reject(error);
  }
);

export default api;
