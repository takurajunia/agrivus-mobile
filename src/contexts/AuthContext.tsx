import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ProfileUpdateData,
} from "../types";
import {
  login,
  register,
  fetchUser,
  updateProfile as updateProfileRequest,
} from "../services/authService";
import { normalizeAuthToken, onAuthExpired } from "../services/api";

type JwtPayload = {
  exp?: number | string;
};

const parseJwtPayload = (token: string): JwtPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64Url = parts[1] ?? "";
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (base64.length % 4)) % 4;
    const padded = `${base64}${"=".repeat(padLength)}`;
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
};

const isJwtExpired = (token: string, nowMs = Date.now()): boolean => {
  const payload = parseJwtPayload(token);
  const expValue = payload?.exp;
  const expSeconds =
    typeof expValue === "number"
      ? expValue
      : typeof expValue === "string"
        ? Number.parseInt(expValue, 10)
        : NaN;

  if (!Number.isFinite(expSeconds) || expSeconds <= 0) {
    // If we cannot determine expiry, treat the token as invalid.
    return true;
  }

  const expMs = expSeconds * 1000;
  const clockSkewMs = 30_000;
  return expMs <= nowMs + clockSkewMs;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from AsyncStorage on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const [rawStoredToken, storedUser] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("user"),
        ]);

        const storedToken = normalizeAuthToken(rawStoredToken);

        // Clean up partially persisted auth state.
        if ((storedToken && !storedUser) || (!storedToken && storedUser)) {
          await AsyncStorage.multiRemove(["token", "user"]);
          return;
        }

        if (storedToken && storedUser) {
          if (isJwtExpired(storedToken)) {
            await AsyncStorage.multiRemove(["token", "user"]);
            return;
          }

          try {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } catch {
            await AsyncStorage.multiRemove(["token", "user"]);
          }
        }
      } catch (error) {
        console.error("Error loading stored auth:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthExpired(() => {
      setUser(null);
      setToken(null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      console.log("Starting login...");
      const response = await login(credentials);
      console.log("Login response:", JSON.stringify(response, null, 2));

      if (response.success) {
        const { user: userData, token: userToken } = response.data;
        const normalizedToken = normalizeAuthToken(userToken);
        if (!normalizedToken) {
          throw new Error("Invalid token received from server");
        }
        console.log("Login successful, setting state...");
        console.log("User data:", userData);
        console.log("Token received:", userToken ? "yes" : "no");

        setUser(userData);
        setToken(normalizedToken);

        await AsyncStorage.setItem("token", normalizedToken);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        console.log("Auth data saved to AsyncStorage");
      } else {
        console.log("Login response success was false");
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      console.log("Login error:", error);
      throw new Error(
        error.response?.data?.message || error.message || "Login failed"
      );
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      const response = await register(data);

      if (response.success) {
        const { user: userData, token: userToken } = response.data;

        const normalizedToken = normalizeAuthToken(userToken);
        if (!normalizedToken) {
          throw new Error("Invalid token received from server");
        }

        setUser(userData);
        setToken(normalizedToken);

        await AsyncStorage.setItem("token", normalizedToken);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
      } else {
        // Handle case where success is false but no exception was thrown
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      console.log("Registration error details:", error);
      // Error message is already enhanced by the API interceptor
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      throw new Error(errorMessage);
    }
  };

  const handleLogout = async () => {
    // Clear local state first to prevent navigation issues
    setUser(null);
    setToken(null);

    // Clear stored auth data
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    // Note: Backend doesn't have a logout endpoint, so we just clear locally
  };

  const handleUpdateProfile = async (data: ProfileUpdateData) => {
    const response = await updateProfileRequest(data);
    setUser(response.user);
    await AsyncStorage.setItem("user", JSON.stringify(response.user));
  };

  const value = {
    user,
    token,
    loading,
    login: handleLogin,
    register: handleRegister,
    updateProfile: handleUpdateProfile,
    logout: handleLogout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
