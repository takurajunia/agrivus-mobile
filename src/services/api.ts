import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  captureApiFailure,
  getConnectivitySnapshot,
} from "./telemetry";
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

type AuthExpiredListener = () => void;

const authExpiredListeners = new Set<AuthExpiredListener>();

let isHandlingUnauthorized = false;

export const normalizeAuthToken = (rawToken: string | null): string | null => {
  if (!rawToken) return null;
  const trimmed = rawToken.trim();
  if (!trimmed) return null;
  return trimmed.replace(/^Bearer\s+/i, "");
};

export const onAuthExpired = (listener: AuthExpiredListener): (() => void) => {
  authExpiredListeners.add(listener);

  return () => {
    authExpiredListeners.delete(listener);
  };
};

const notifyAuthExpired = () => {
  authExpiredListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Ignore listener errors so one consumer cannot block others.
    }
  });
};

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
    const rawToken = await AsyncStorage.getItem("token");
    const token = normalizeAuthToken(rawToken);
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
  },
);

// ── Retry policy ──────────────────────────────────────────────────────────────
const MAX_GET_RETRIES = 2; // 3 attempts total
const RETRY_BASE_DELAY_MS = 600;
const RETRY_JITTER_MS = 250;

type RetriableConfig = InternalAxiosRequestConfig & { __retryCount?: number };

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Retry only requests that are safe to repeat and plausibly transient.
 *
 * GET only — replaying a POST could double-submit an order or a bid. A missing
 * response means the request never landed (dropped connection, timeout), and a
 * 5xx is often a restart or cold start. Everything else is left alone: 4xx will
 * fail identically on a retry, and retrying a 429 would only dig the rate limit
 * deeper.
 */
const isRetriableGet = (error: AxiosError): boolean => {
  if (error.config?.method?.toLowerCase() !== "get") return false;
  if (!error.response) return true;
  return error.response.status >= 500;
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(
      `API Response: ${response.config.method?.toUpperCase()} ${
        response.config.url
      } - ${response.status}`,
    );
    return response;
  },
  async (error: AxiosError) => {
    // Retry transient read failures before surfacing anything to the caller.
    // This absorbs the brief connection drops and server restarts that would
    // otherwise reach the user as a hard error with no recovery path.
    const retriableConfig = error.config as RetriableConfig | undefined;
    if (retriableConfig && isRetriableGet(error)) {
      const attempt = (retriableConfig.__retryCount ?? 0) + 1;
      if (attempt <= MAX_GET_RETRIES) {
        retriableConfig.__retryCount = attempt;
        // Exponential backoff, jittered so that screens failing together do
        // not resynchronise into a retry burst against a recovering server.
        const backoffMs =
          RETRY_BASE_DELAY_MS * 2 ** (attempt - 1) +
          Math.random() * RETRY_JITTER_MS;
        if (__DEV__) {
          console.log(
            `API Retry ${attempt}/${MAX_GET_RETRIES}: ${error.config?.url}`,
          );
        }
        await sleep(backoffMs);
        return api(retriableConfig);
      }
    }

    const serverMessage = (
      error.response?.data as { message?: string } | undefined
    )?.message;

    // Log error details for debugging
    if (__DEV__) {
      console.log("API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: serverMessage || error.message,
        data: error.response?.data,
      });
    }

    if (error.response?.status === 401) {
      // Token expired or invalid
      if (!isHandlingUnauthorized) {
        isHandlingUnauthorized = true;
        console.log("401 received - clearing auth data");

        try {
          await AsyncStorage.multiRemove(["token", "user"]);
          notifyAuthExpired();
        } finally {
          isHandlingUnauthorized = false;
        }
      }
    }

    // Enhance error with readable message.
    // When no response arrived we cannot tell from the error alone whether the
    // device lost its connection or the server is unreachable, so ask NetInfo
    // rather than blaming the server for what is usually a dropped signal.
    const status = error.response?.status;
    const needsDiagnosis = !error.response || (status ?? 0) >= 500;

    if (needsDiagnosis) {
      // One snapshot serves both purposes: choosing honest wording for the
      // user, and giving the error report enough context to tell the failure
      // modes apart later.
      const snapshot = await getConnectivitySnapshot();

      if (!error.response) {
        if (snapshot.offline) {
          error.message = "You're offline. Check your connection and try again.";
        } else if (error.code === "ECONNABORTED") {
          error.message = "This is taking longer than usual. Please try again.";
        } else {
          error.message = "Couldn't reach Agrivus. Please try again in a moment.";
        }
      }

      captureApiFailure(error, snapshot, (retriableConfig?.__retryCount ?? 0) + 1);
    }

    if (serverMessage) {
      error.message = serverMessage;
    }

    return Promise.reject(error);
  },
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

const getCachedEntry = async <T>(
  cacheKey: string,
): Promise<CachedEntry<T> | null> => {
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
  options?: CacheOptions,
): Promise<T> => {
  const cacheKey = getCacheKey(url, config);
  const ttlMs = options?.ttlMs ?? DEFAULT_CACHE_TTL_MS;
  const now = Date.now();
  const cached = await getCachedEntry<T>(cacheKey);
  const isFresh = !!cached && now - cached.timestamp < Math.max(ttlMs, 0);

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
