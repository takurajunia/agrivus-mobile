import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AxiosRequestConfig } from "axios";

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

const CACHE_KEY_PREFIX = "api_cache:";
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

interface CachedEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheOptions {
  ttlMs?: number;
  forceRefresh?: boolean;
}

const toStableString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value !== "object") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => toStableString(item)).join(",")}]`;
  }

  const objectValue = value as Record<string, unknown>;
  const sortedKeys = Object.keys(objectValue).sort();
  return `{${sortedKeys
    .map((key) => `${key}:${toStableString(objectValue[key])}`)
    .join(",")}}`;
};

const getCacheKey = (url: string, config?: AxiosRequestConfig): string => {
  const params = config?.params ? toStableString(config.params) : "";
  return `${CACHE_KEY_PREFIX}${url}?${params}`;
};

const getCachedEntry = async <T>(cacheKey: string): Promise<CachedEntry<T> | null> => {
  try {
    const raw = await AsyncStorage.getItem(cacheKey);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as CachedEntry<T>;
  } catch {
    return null;
  }
};

export const getWithCache = async <T>(
  url: string,
  config?: AxiosRequestConfig,
  options?: CacheOptions
): Promise<T> => {
  const cacheKey = getCacheKey(url, config);
  const ttlMs = options?.ttlMs ?? DEFAULT_CACHE_TTL_MS;
  const now = Date.now();
  const cached = await getCachedEntry<T>(cacheKey);
  const isFresh =
    !!cached && now - cached.timestamp < Math.max(ttlMs, 0);

  if (!options?.forceRefresh && isFresh) {
    return cached.data;
  }

  try {
    const response = await api.get<T>(url, config);
    const entry: CachedEntry<T> = {
      data: response.data,
      timestamp: now,
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
    return response.data;
  } catch (error) {
    if (cached) {
      return cached.data;
    }
    throw error;
  }
};

export default api;
