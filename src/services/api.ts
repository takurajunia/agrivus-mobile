import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// For development, you can use your local IP address
// Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find your IP
// For production, use your deployed backend URL
const API_BASE_URL = __DEV__
  ? "http://192.168.70.41:5000" // Replace with your computer's IP address
  : "https://your-production-api.com"; // Replace with production URL

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000, // 15 second timeout for faster feedback
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
    // Log error details for debugging
    if (__DEV__) {
      console.log("API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
    }

    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    }

    // Enhance error with readable message
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    } else if (error.code === "ECONNABORTED") {
      error.message = "Request timed out. Please check your connection.";
    } else if (!error.response) {
      error.message = "Network error. Please check if the server is running.";
    }

    return Promise.reject(error);
  }
);

export default api;
