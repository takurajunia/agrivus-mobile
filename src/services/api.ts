import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Use the deployed Railway backend for both dev and production
// This ensures consistent behavior and no need to run local backend
const API_BASE_URL = "https://agrivus-backend-production.up.railway.app";

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
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(
      `API Response: ${response.config.method?.toUpperCase()} ${
        response.config.url
      } - ${response.status}`
    );
    return response;
  },
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
      console.log("401 received - clearing auth data");
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
