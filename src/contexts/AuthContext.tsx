import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "../types";
import { login, register, fetchUser } from "../services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
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
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading stored auth:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      console.log("Starting login...");
      const response = await login(credentials);
      console.log("Login response:", JSON.stringify(response, null, 2));

      if (response.success) {
        const { user: userData, token: userToken } = response.data;
        console.log("Login successful, setting state...");
        console.log("User data:", userData);
        console.log("Token received:", userToken ? "yes" : "no");

        setUser(userData);
        setToken(userToken);

        await AsyncStorage.setItem("token", userToken);
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

        setUser(userData);
        setToken(userToken);

        await AsyncStorage.setItem("token", userToken);
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

  const value = {
    user,
    token,
    loading,
    login: handleLogin,
    register: handleRegister,
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
